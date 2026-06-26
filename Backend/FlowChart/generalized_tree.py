import ast
import os
from tree_sitter import Language, Parser, Query

# Import the individual language grammars directly
import tree_sitter_javascript as ts_js
import tree_sitter_typescript as ts_tsx
import tree_sitter_java as ts_java

def get_python_imports(file_path,project_root):
    with open(file_path,"r",encoding="utf-8") as f:
        file_content=f.read()
        
    tree=ast.parse(file_content)
    # print(ast.dump(tree, indent=4))
   # we gathered raw strings ["util.parsr","core"]
    imports=[]
    for node in ast.walk(tree):
        
        if isinstance(node,ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node,ast.ImportFrom):
            if node.module:
                imports.append(node.module)

    # resloved paths
    resolved_paths=[]
    for imp in imports:
        files=imp.split(".")
        relative_file_path=os.path.join(*files)+".py"
        #absolute path
        abs_path=os.path.join(project_root,relative_file_path)
        print("Import found:", imp)
        print("Checking:", abs_path)
        print("Exists:", os.path.exists(abs_path))
        print()

        if os.path.exists(abs_path):
            resolved_paths.append(relative_file_path)

    return resolved_paths

# root = "D:/InternshipProject/ERSS Project/Backend"
# target_file = "D:/InternshipProject/ERSS Project/Backend/audit_trigger.py"
# print(get_python_imports(target_file,root))

def get_treesitter_imports(file_path,project_root,lang_str):
    try:
        # 1. Load the specific language object safely using the new API
        if lang_str in ["javascript", ".jsx", ".js", "jsx"]:
            language = Language(ts_js.language())
            query_str = "(import_statement source: (string) @import_path)"
        elif lang_str in ["tsx", "typescript", ".tsx", ".ts"]:
            language = ts_tsx.language()
            query_str = "(import_statement source: (string) @import_path)"
        elif lang_str == "java":
            language = Language(ts_java.language())
            query_str = "(import_declaration (scoped_identifier) @import_path)"
        else:
            return []
        
        parser = Parser(language)
        
        # Read the target file
        with open(file_path, "r", encoding="utf-8") as f:
            source_code = f.read()
        
        # Parse requires a raw byte array
        tree = parser.parse(bytes(source_code, "utf-8"))

        raw_imports=[]
        def get_imports_from_node(node):
                if node.type == "import_statement":
                    for child in node.children:
                        if child.type == "string":
                            text = child.text.decode("utf-8").strip("'\"")
                            raw_imports.append(text)
                for child in node.children:
                    get_imports_from_node(child)
            
        get_imports_from_node(tree.root_node)
        print("raw imports found:", raw_imports)
        
        resolved_paths=[]
        file_dir=os.path.dirname(file_path)
        for imp in raw_imports:
            if(imp.startswith(".")):
                combined_path=os.path.normpath(os.path.join(file_dir,imp))
                for ext in [".jsx",".js",".tsx",".ts"]:
                    full_path=combined_path+ext
                    if os.path.exists(full_path):
                        rel_from_root=os.path.relpath(full_path,project_root)
                        resolved_paths.append(rel_from_root)
                        break
        return resolved_paths
    

    except Exception as e:
        print(e)
        return []
        

def extract_dependencies(file_path,project_root):
    if not os.path.exists(file_path):
        return []
    _,ext=os.path.splitext(file_path)
    ext=ext.lower()
    if ext == ".py":
        return get_python_imports(file_path, project_root)
    elif ext in [".js", ".jsx"]:
        return get_treesitter_imports(file_path, project_root, "javascript")
    elif ext in [".ts", ".tsx"]:
        return get_treesitter_imports(file_path, project_root, "tsx")
    elif ext == ".java":
        return get_treesitter_imports(file_path, project_root, "java")
    
    return []


print(get_treesitter_imports("D:/AI Coding Assistant/Frontend/src/App.jsx","D:/AI Coding Assistant/Frontend",".jsx"))


