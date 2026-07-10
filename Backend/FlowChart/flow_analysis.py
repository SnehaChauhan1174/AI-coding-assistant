import re
from tree_sitter import Parser, Language
import tree_sitter_javascript as ts_js

language=Language(ts_js.language())
parser=Parser(language)

def extract_components(source_bytes):
    tree=parser.parse(source_bytes)
    components=[]
    def walk(node):
        if node.type=="function_declaration":
            name=None
            for child in node.children:
                if child.type=="identifier":
                    name=source_bytes[child.start_byte:child.end_byte].decode("utf8")
                    break
            if name:
                components.append({
                    "name":name,
                    "node":node,
                    "source": source_bytes[node.start_byte:node.end_byte].decode("utf8")
                })

        elif node.type=="lexical_declaration":
            text = source_bytes[node.start_byte:node.end_byte].decode("utf8")
            if "=>" in text:
                var=None
                for child in node.children:
                    if child.type=="variable_declarato":
                        for c in child.children:
                            if c.type=="identifier":
                                var = source_bytes[c.start_byte:c.end_byte].decode("utf8")
                                break
                    if var:
                        break
                if var:
                    components.append({
                        "name":var,
                        "node":node,
                        "source": source_bytes[node.start_byte:node.end_byte].decode("utf8")
                    })
        for child in node.children:
            walk(child)
    walk(tree.root_node)
    return components


# extract usestate
# id, name, seter, intial_val

def extract_states(component_node, source_code):
    states=[]
    def walk(node):
        if node.type=="lexical_declaration":
            text=source_code[node.start_byte:node.end_byte]
            if "useState(" not in text:
                pass
            else:
                array_node = None
                call_node = None
                def find(n):
                    nonlocal array_node
                    nonlocal call_node
                    if n.type == "array_pattern":
                        array_node = n
                    if n.type == "call_expression":
                        call_node = n
                    for c in n.children:
                        find(c)
                find(node)
                if array_node:
                    ids = []
                    for c in array_node.children:
                        if c.type == "identifier":
                            ids.append(
                                source_bytes[
                                    c.start_byte:c.end_byte
                                ].decode()
                            )
                    initial = ""
                    if call_node:
                        initial = source_bytes[
                            call_node.start_byte:call_node.end_byte
                        ].decode()
                    if len(ids) == 2:
                        states.append({
                            "id": f"state_{ids[0]}",
                            "name": ids[0],
                            "setter": ids[1],
                            "initial": initial
                        })
        for child in node.children:
            walk(child)
    walk(component_node)
    return states




# extract handlers
# const handlePath=async()=>{} or function handlePath(){}
# id, name
def extract_handlers(component,source_bytes):
    source=component["source"]
    handlers=[]
    def walk(node):
        if node.type=="function_declaration":
            func_name=None
            for child in node.children:
                if child.type=="identifier":
                    func_name=source_bytes[
                    child.start_byte:child.end_byte].decode("utf-8")
                    break
            if func_name and(
                func_name.startswith("handle") or func_name.startswith("on") or func_name.startswith("fetch")
                or func_name.startswith("load")
                or func_name.startswith("run")

            ):
                handlers.append({
                    "id": func_name,
                    "name": func_name,
                    "async": False,
                    "node": node
                })

        elif node.type == "lexical_declaration":

            for child in node.children:

                if child.type != "variable_declarator":
                    continue

                identifier = None
                function_node = None
                is_async = False

                for c in child.children:

                    # variable name
                    if c.type == "identifier":
                        identifier = source_bytes[
                            c.start_byte:c.end_byte
                        ].decode("utf8")

                    # arrow function
                    elif c.type == "arrow_function":
                        function_node = c

                        # async arrow?
                        text = source_bytes[
                            c.start_byte:c.end_byte
                        ].decode("utf8")

                        if text.strip().startswith("async"):
                            is_async = True

                    # function expression
                    elif c.type == "function":
                        function_node = c

                if (
                    identifier
                    and function_node
                    and (
                        identifier.startswith("handle")
                        or identifier.startswith("on")
                        or identifier.startswith("fetch")
                        or identifier.startswith("load")
                        or identifier.startswith("run")
                    )
                ):

                    handlers.append({
                        "id": identifier,
                        "name": identifier,
                        "async": is_async,
                        "node": function_node
                    })

        # recurse
        for child in node.children:
            walk(child)

    walk(component["node"])

    return handlers 






# extract jsx events
# <button onClick={handlePath}>
# event: click, name of element:, handler:handlePath
# def extract_jsx_events(tree):



# extract api calls
# find fetch() axios.get() axios post()
# handler, mwthod, route
def extract_api_calls(handler, source_bytes):
    """
    Extract API calls inside one handler.

    Returns:
    [
        {
            "handler": "handlePath",
            "method": "GET",
            "route": "http://localhost:8000/files?path=${path}",
            "client": "fetch"
        }
    ]
    """

    api_calls = []

    handler_name = handler["id"]
    root = handler["node"]

    def text(node):
        return source_bytes[node.start_byte:node.end_byte].decode("utf8")

    def walk(node):

        # -------------------------------
        # function call
        # -------------------------------

        if node.type == "call_expression":

            func = None
            arguments = None

            for child in node.children:

                if child.type in [
                    "identifier",
                    "member_expression",
                    "subscript_expression"
                ]:
                    func = child

                elif child.type == "arguments":
                    arguments = child

            if func is None:
                pass

            else:

                func_text = text(func)

                # ==================================
                # fetch(...)
                # ==================================

                if func_text == "fetch":

                    route = None
                    method = "GET"

                    if arguments:

                        arg_nodes = [
                            c for c in arguments.children
                            if c.type not in ["(", ")", ","]
                        ]

                        if len(arg_nodes) >= 1:
                            route = text(arg_nodes[0])

                        if len(arg_nodes) >= 2:

                            options = text(arg_nodes[1])

                            if 'method:"POST"' in options or "method:'POST'" in options:
                                method = "POST"

                            elif 'method:"PUT"' in options or "method:'PUT'" in options:
                                method = "PUT"

                            elif 'method:"DELETE"' in options or "method:'DELETE'" in options:
                                method = "DELETE"

                            elif 'method:"PATCH"' in options or "method:'PATCH'" in options:
                                method = "PATCH"

                    api_calls.append({
                        "handler": handler_name,
                        "client": "fetch",
                        "method": method,
                        "route": route
                    })

                # ==================================
                # axios.get/post/put/delete
                # ==================================

                elif func_text.startswith("axios."):

                    method = func_text.split(".")[-1].upper()

                    route = None

                    if arguments:
                        arg_nodes = [
                            c for c in arguments.children
                            if c.type not in ["(", ")", ","]
                        ]

                        if len(arg_nodes):
                            route = text(arg_nodes[0])

                    api_calls.append({
                        "handler": handler_name,
                        "client": "axios",
                        "method": method,
                        "route": route
                    })

        for child in node.children:
            walk(child)

    walk(root)

    return api_calls
    





# def print_tree(node, source_bytes, indent=0):
#     text = source_bytes[node.start_byte:node.end_byte].decode(
#         "utf8", errors="ignore"
#     )

#     # Avoid printing huge chunks
#     text = text.replace("\n", "\\n")[:50]

#     print(
#         "  " * indent +
#         f"{node.type} [{node.start_point}-{node.end_point}] -> {text}"
#     )

#     for child in node.children:
#         print_tree(child, source_bytes, indent + 1)



if __name__=="__main__":
    with open("D:/AI Coding Assistant/Frontend/src/Components/FileExplorer.jsx","rb") as f:
        source_bytes=f.read()
    source_code=source_bytes.decode("utf-8")

    # print(extract_components(source_bytes)) 
    # tree=parser.parse(source_bytes)
    # print_tree(tree.root_node,source_bytes)
    comp=extract_components(source_bytes)
    # print(comp)
    for c in comp:
        print("="*10)
        print(c["name"])
        handlers = extract_handlers(c, source_bytes)

        for h in handlers:
            print(h["id"])

            apis = extract_api_calls(h, source_bytes)

            for api in apis:
                print(api)


