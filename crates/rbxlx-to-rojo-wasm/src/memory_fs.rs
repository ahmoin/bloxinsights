use crate::structures::*;
use serde::{ser::SerializeMap, Serialize, Serializer};
use std::{
    collections::{BTreeMap, BTreeSet},
    io::Cursor,
    path::PathBuf,
};
use zip::{write::FileOptions, ZipWriter};

const SRC: &str = "src";

fn serialize_project_tree<S: Serializer>(
    tree: &BTreeMap<String, TreePartition>,
    serializer: S,
) -> Result<S::Ok, S::Error> {
    let mut map = serializer.serialize_map(Some(tree.len() + 1))?;
    map.serialize_entry("$className", "DataModel")?;
    for (k, v) in tree {
        map.serialize_entry(k, v)?;
    }
    map.end()
}

#[derive(Clone, Debug, Serialize)]
struct Project {
    name: String,
    #[serde(serialize_with = "serialize_project_tree")]
    tree: BTreeMap<String, TreePartition>,
}

impl Project {
    fn new(name: String) -> Self {
        Self {
            name,
            tree: BTreeMap::new(),
        }
    }
}

fn to_zip_path(path: &std::path::Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

pub struct MemoryFileSystem {
    project: Project,
    source: PathBuf,
    written_folders: BTreeSet<String>,
    zip: ZipWriter<Cursor<Vec<u8>>>,
    files: BTreeMap<String, Vec<u8>>,
}

impl MemoryFileSystem {
    pub fn new(project_name: String) -> Self {
        Self {
            project: Project::new(project_name),
            source: PathBuf::from(SRC),
            written_folders: BTreeSet::new(),
            zip: ZipWriter::new(Cursor::new(Vec::new())),
            files: BTreeMap::new(),
        }
    }

    fn ensure_folder(&mut self, folder: &std::path::Path) {
        let zip_path = to_zip_path(folder);
        if zip_path.is_empty() || !self.written_folders.insert(zip_path.clone()) {
            return;
        }
        self.zip
            .add_directory(format!("{zip_path}/"), FileOptions::default())
            .expect("couldn't add directory to zip");
    }

    pub fn into_output(mut self) -> Result<(Vec<u8>, BTreeMap<String, Vec<u8>>), String> {
        let contents =
            serde_json::to_string_pretty(&self.project).expect("couldn't serialize project");
        self.zip
            .start_file("default.project.json", FileOptions::default())
            .map_err(|error| error.to_string())?;
        std::io::Write::write_all(&mut self.zip, contents.as_bytes())
            .map_err(|error| error.to_string())?;
        self.files
            .insert("default.project.json".to_string(), contents.into_bytes());

        let cursor = self.zip.finish().map_err(|error| error.to_string())?;
        Ok((cursor.into_inner(), self.files))
    }
}

impl InstructionReader for MemoryFileSystem {
    fn read_instruction<'a>(&mut self, instruction: Instruction<'a>) {
        match instruction {
            Instruction::AddToTree {
                name,
                mut partition,
            } => {
                assert!(
                    self.project.tree.get(&name).is_none(),
                    "Duplicate item added to tree! Instances can't have the same name: {}",
                    name
                );

                if let Some(path) = partition.path {
                    partition.path = Some(PathBuf::from(SRC).join(path));
                }

                for child in partition.children.values_mut() {
                    if let Some(path) = &child.path {
                        child.path = Some(PathBuf::from(SRC).join(path));
                    }
                }

                self.project.tree.insert(name, partition);
            }

            Instruction::CreateFile { filename, contents } => {
                if let Some(parent) = self.source.join(&filename).parent() {
                    self.ensure_folder(parent);
                }
                let zip_path = to_zip_path(&self.source.join(&filename));
                self.zip
                    .start_file(zip_path.clone(), FileOptions::default())
                    .unwrap_or_else(|error| {
                        panic!("can't create file {:?}: {:?}", filename, error)
                    });
                std::io::Write::write_all(&mut self.zip, &contents).unwrap_or_else(|error| {
                    panic!("can't write to file {:?} due to {:?}", filename, error)
                });
                self.files.insert(zip_path, contents.into_owned());
            }

            Instruction::CreateFolder { folder } => {
                self.ensure_folder(&self.source.join(&folder));
            }
        }
    }
}
