import AceEditor from "react-ace";
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/theme-solarized_light'
import 'ace-builds/src-noconflict/theme-tomorrow'
import 'ace-builds/src-noconflict/ext-language_tools'
import {useSQLStore} from "../store/SqlStore";
import {useDuckDB} from "../store/DuckDB";
import {execSql} from "./DeltaSharingBrowser";
import { format } from "sql-formatter";
// import 'ace-builds/src-noconflict/snippets/aql'

export const CodeEditor = () => {
    const setSqlString = useSQLStore((state) => state.setSqlString)

    function onChange(newValue: string) {
        console.log(newValue)
        setSqlString(newValue)
    }

    const tables = useSQLStore((state) => state.tables)

    const [db] = useDuckDB((state) => [
        state.db
    ])
    const setData = useSQLStore((state) => state.setData)
    const setLoading = useSQLStore((state) => state.setLoading)

    return (
        <>
            {db && <AceEditor
                width={"100%"}

                // height={"auto"}
                mode="sql"
                theme="tomorrow"
                onChange={onChange}
                onFocus={(_, editor) => {
                    editor?.completers.push({
                        getCompletions: function (editor, session, pos, prefix, callback) {
                            // @ts-ignore
                            var completions = [];
                            // we can use session and pos here to decide what we are going to show
                            tables?.forEach(function (w) {
                                completions.push({
                                    value: w,
                                    meta: "Table",
                                });
                            });
                            // @ts-ignore
                            callback(null, completions);
                        }
                    })
                }}
                name="UNIQUE_ID_OF_DIV"
                commands={[{   // commands is array of key bindings.
                    name: 'execute_statement', //name for the key binding.
                    bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'}, //key combination used for the command.
                    exec: (editor) => {
                        // let sqlStmt = (editor.getSelectedText() !== "") ? editor.getSelectedText() : editor.getValue()
                        // console.log(editor.getSelectedText())
                        console.log('key-binding used')
                        console.log(editor.getValue())
                        execSql(db, editor.getValue(), setData, setLoading)
                        // .catch((error) => console.log(error))
                    }  //function to execute when keys are pressed.
                }, {   // commands is array of key bindings.
                    name: 'format_statement', //name for the key binding.
                    bindKey: {win: 'Ctrl-F', mac: 'Command-F'}, //key combination used for the command.
                    exec: (editor) => {
                        // let sqlStmt = (editor.getSelectedText() !== "") ? editor.getSelectedText() : editor.getValue()
                        // console.log(editor.getSelectedText())
                        console.log('format_stmt used')
                        console.log(editor.getValue())
                        let res = format(editor.getValue(), {
                          language: 'spark',
                          tabWidth: 2,
                          keywordCase: 'upper',
                          linesBetweenQueries: 2,
                        });
                        editor.setValue(res)
                        // execSql(db, editor.getValue(), setData, setLoading)
                        // .catch((error) => console.log(error))
                    }  //function to execute when keys are pressed.
                },
                ]}
                onLoad={editorInstance => {
                    // mouseup = css resize end
                    document.addEventListener("mouseup", e => (
                        editorInstance.resize()
                    ));
                }}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{

                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    // enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 4,
                }}
            />}
        </>
    )
}