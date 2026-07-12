mod convert;
mod memory_fs;
mod structures;

use memory_fs::MemoryFileSystem;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn convert(bytes: &[u8], extension: &str, project_name: &str) -> Result<Vec<u8>, JsValue> {
    let tree = match extension {
        "rbxlx" | "rbxmx" => rbx_xml::from_reader_default(bytes)
            .map_err(|error| JsValue::from_str(&error.to_string()))?,
        "rbxl" | "rbxm" => rbx_binary::from_reader_default(bytes)
            .map_err(|error| JsValue::from_str(&error.to_string()))?,
        _ => {
            return Err(JsValue::from_str(
                "Unsupported file extension. Expected .rbxlx, .rbxmx, .rbxl, or .rbxm",
            ))
        }
    };

    let mut filesystem = MemoryFileSystem::new(project_name.to_string());
    convert::process_instructions(&tree, &mut filesystem);
    filesystem
        .into_zip()
        .map_err(|error| JsValue::from_str(&error))
}
