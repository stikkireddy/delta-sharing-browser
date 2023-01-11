import AceEditor from "react-ace";
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/theme-solarized_light'
import 'ace-builds/src-noconflict/theme-tomorrow'
import 'ace-builds/src-noconflict/ext-language_tools'
import {ShareHelper, useSQLStore} from "../store/SqlStore";
import {useDuckDB} from "../store/DuckDB";
import {execSql} from "./DeltaSharingBrowser";
import {format} from "sql-formatter";
import shallow from "zustand/shallow";
import 'ace-builds/src-noconflict/snippets/sql'
import {useState} from "react";

export const CodeEditor = () => {
    const setSqlString = useSQLStore((state) => state.setSqlString)
    const [editor, setEditor] = useState<any>()

    function onChange(newValue: string) {
        setSqlString(newValue)
    }

    const tables = useSQLStore((state) => state.tables)

    const db = useDuckDB((state) => state.db)
    const conn = useDuckDB((state) => state.conn)

    const setData = useSQLStore((state) => state.setData)
    const setLoading = useSQLStore((state) => state.setLoading)
    const setQueryStatus = useSQLStore((state) => state.setQueryStatus)
    const setSelectedSql = useSQLStore((state) => state.setSelectedSql)

    const addDuckDbView = useSQLStore((state) => state.addDuckDbView)

    // @ts-ignore
    const runsql = (editor) => {
        if (editor.getSelectedText() === "" || editor.getSelectedText() === null) {
            execSql(conn, editor.getValue(), setData, setLoading, setQueryStatus, addDuckDbView)
            return
        }
        // console.log(editor.getSelectedText())
        execSql(conn, editor.getSelectedText(), setData, setLoading, setQueryStatus, addDuckDbView)
    }

    return (
        <>
            {db && <AceEditor
                width={"100%"}
                height={"100%"}
                // height={"400px"}
                mode="sql"
                theme="tomorrow"
                onSelectionChange={(selectedValue, event) => {
                    // console.log(selectedValue, event)
                    // console.log(editor.getSelectedText())
                    if (selectedValue.isEmpty()) {
                        setSelectedSql(false)
                    } else {
                        setSqlString(editor.getSelectedText())
                        setSelectedSql(true)
                    }

                }}
                onChange={onChange}
                onFocus={(_, editor) => {
                    setEditor(editor)
                    setSqlString(editor?.getValue() ?? "")
                    editor?.completers.push({
                        getCompletions: function (editor, session, pos, prefix, callback) {
                            // @ts-ignore
                            var completions = [];
                            // we can use session and pos here to decide what we are going to show
                            tables?.forEach(function (w) {
                                completions.push({
                                    name: w.tableName,
                                    value: ShareHelper.makeDuckDbViewFullName(w),
                                    meta: "View",
                                });
                            });
                            // @ts-ignore
                            callback(null, completions);
                        }
                    })
                    editor?.commands.removeCommand(
                        {   // commands is array of key bindings.
                            name: 'execute_statement', //name for the key binding.
                            bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'}, //key combination used for the command.
                            exec: runsql,
                        })
                    editor?.commands.addCommand({   // commands is array of key bindings.
                        name: 'execute_statement', //name for the key binding.
                        bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'}, //key combination used for the command.
                        exec: runsql,

                    })
                }}
                name="deltasharing-sql-editor"
                commands={[{   // commands is array of key bindings.
                    name: 'execute_statement', //name for the key binding.
                    bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'}, //key combination used for the command.
                    exec: runsql,
                }, {   // commands is array of key bindings.
                    name: 'format_statement', //name for the key binding.
                    bindKey: {win: 'Ctrl-F', mac: 'Command-F'}, //key combination used for the command.
                    exec: (editor) => {
                        let res = format(editor.getValue(), {
                            language: 'spark',
                            tabWidth: 2,
                            keywordCase: 'upper',
                            linesBetweenQueries: 2,
                        });
                        editor.setValue(res)
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
                defaultValue={"SELECT * FROM sri_delta_share_sri_delta_sharing.airports;"}
                setOptions={{

                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 4,
                }}
            />}
        </>
    )
}