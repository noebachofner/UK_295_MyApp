use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    text: String,
}

impl CreateTodo {
    pub fn set_text(&mut self, text: String) {
        self.text = text;
    }

    pub fn text(&self) -> &str {
        &self.text
    }
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    text: Option<String>,
    completed: Option<bool>,
}

impl UpdateTodo {
    pub fn completed(&self) -> Option<bool> {
        self.completed
    }

    pub fn text(&self) -> Option<&String> {
        self.text.as_ref()
    }
}

pub type Db = Arc<RwLock<HashMap<Uuid, Todo>>>;

#[derive(Debug, Serialize, Clone)]
pub struct Todo {
    id: Uuid,
    text: String,
    completed: bool,
}

impl Todo {
    pub fn new(text: String, completed: bool) -> Self {
        Self {
            id: Uuid::new_v4(),
            text,
            completed,
        }
    }

    pub fn text(&self) -> &str {
        &self.text
    }

    pub fn set_text(&mut self, text: String) {
        self.text = text;
    }

    pub fn set_completed(&mut self, completed: bool) {
        self.completed = completed;
    }

    pub fn id(&self) -> Uuid {
        self.id
    }
}

#[derive(Debug, Deserialize, Default)]
pub struct Pagination {
    pub offset: Option<usize>,
    pub limit: Option<usize>,
}
