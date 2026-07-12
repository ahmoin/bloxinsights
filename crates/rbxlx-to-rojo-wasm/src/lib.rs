mod convert;
mod memory_fs;
mod structures;

use js_sys::{Array, Object, Reflect, Uint8Array};
use memory_fs::MemoryFileSystem;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn convert(
    bytes: &[u8],
    extension: &str,
    project_name: &str,
    exclude_init_meta: bool,
) -> Result<JsValue, JsValue> {
    let tree = match extension {
        "rbxlx" | "rbxmx" => rbx_xml::from_reader_default(bytes)
            .map_err(|error| JsValue::from_str(&error.to_string()))?,
        "rbxl" | "rbxm" => rbx_binary::from_reader(bytes)
            .map_err(|error| JsValue::from_str(&error.to_string()))?,
        _ => {
            return Err(JsValue::from_str(
                "Unsupported file extension. Expected .rbxlx, .rbxmx, .rbxl, or .rbxm",
            ))
        }
    };

    let mut filesystem = MemoryFileSystem::new(project_name.to_string());
    convert::process_instructions(&tree, &mut filesystem, exclude_init_meta);
    let (zip, files) = filesystem
        .into_output()
        .map_err(|error| JsValue::from_str(&error))?;

    let files_array = Array::new();
    for (path, contents) in files {
        let entry = Object::new();
        Reflect::set(&entry, &JsValue::from_str("path"), &JsValue::from_str(&path))?;
        Reflect::set(
            &entry,
            &JsValue::from_str("contents"),
            &JsValue::from_str(&String::from_utf8_lossy(&contents)),
        )?;
        files_array.push(&entry);
    }

    let output = Object::new();
    Reflect::set(
        &output,
        &JsValue::from_str("zip"),
        &Uint8Array::from(zip.as_slice()),
    )?;
    Reflect::set(&output, &JsValue::from_str("files"), &files_array)?;

    Ok(output.into())
}
