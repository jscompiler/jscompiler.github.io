
/**
 * Set the Monaco Editor
 */
const setEditor = (editor) => {
    if(editor) window.editor = editor;
}

/**
 * Get the Editor
 * @returns
 */
const getEditor = () => {
    if(window.editor) return window.editor;
    return null;
}

/**
 * Convert milisecond to human readble 
 * time format
 * @param {Number} ms 
 * @returns 
 */
const inHumanReadbleTime = (ms) => {
    let seconds = (ms / 1000).toFixed(2);
    let minutes = (ms / (1000 * 60)).toFixed(2);
    let hours = (ms / (1000 * 60 * 60)).toFixed(2);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(2);
    
    if(ms < 100) return ms.toFixed(2) + " Ms";
    else if (seconds < 60) return seconds + " Sec";
    else if (minutes < 60) return minutes + " Min";
    else if (hours < 24) return hours + " Hrs";
    else return days + " Days";
}

/**
 * Init About Menu
 */
const initAboutMenu = () => {
    const aboutEditor = document.getElementById('aboutEditor');
    const aboutEditorModal = new bootstrap.Modal(document.getElementById('aboutEditorModal'), {
        keyboard: false,
        backdrop: 'static'
    });

    aboutEditor.addEventListener("click", () => {
        aboutEditorModal.toggle();
    });
}

/**
 * Download Canvas
 * @param {Object} canvas 
 * @param {String} filename 
 */
const downloadCanvas = (canvas, filename) => {
    var lnk = document.createElement('a'), e;

    lnk.download = filename;
    lnk.href = canvas.toDataURL("image/png;base64");
  
    if (document.createEvent) {
      e = document.createEvent("MouseEvents");
      e.initMouseEvent("click", true, true, window,
                       0, 0, 0, 0, 0, false, false, false,
                       false, 0, null);
  
      lnk.dispatchEvent(e);
    } 
    else if (lnk.fireEvent) {
      lnk.fireEvent("onclick");
    }
}

/**
 * Init Capture Menu
 */
const initCaptureMenu = () => {
    const captureEditor = document.getElementById('captureEditor');

    captureEditor.addEventListener("click", () => {
        let codeEditor = document.getElementById('codeEditor');

        html2canvas(codeEditor)
            .then(canvas => {
                downloadCanvas(canvas, "code.png");
            })
            .catch(err => {
                console.log(err);
            })
    });
}

/**
 * Set the default values for 
 * Preference form
 * @returns null
 */
const setPreferenceDefaultValues = () => {

    let preselectedPreferences = {
        wordWrap: false,
        lineNumbers: true,
        roundedSelection: true,
        scrollBeyondLastLine: true,
        fontSize: 14
    }

    if(localStorage.getItem('editorSettings')) {
        preselectedPreferences = { ...preselectedPreferences, ...JSON.parse(localStorage.getItem('editorSettings')) };
    }

    const formEl = document.forms.preferencesForm;
    Object.values(formEl).forEach((field) => {

        const configCheck = ['lineNumbers', 'roundedSelection', 'scrollBeyondLastLine', 'wordWrap'];
        if(configCheck.includes(field.name)) {
            field.checked = preselectedPreferences[field.name];
            return;
        }

        if(field.name === 'theme') {
            field.checked = preselectedPreferences[field.name] === "vs-dark" ? true : false;
            return;
        }

        if(field.name === 'wordWrap') {
            field.checked = preselectedPreferences[field.name] === "on";
            return;
        }

        field.value = preselectedPreferences[field.name];
    });
}

/**
 * Hanlde Preference Form
 * @param {HTMlInputEvent} event 
 * @returns 
 */
const formSubmit = (event) => {
    event.preventDefault();

    const configCheck = ['lineNumbers', 'roundedSelection', 'scrollBeyondLastLine', 'theme', 'wordWrap'];
    const formEl = document.forms.preferencesForm;

    const fieldValues = Object.values(formEl).reduce((ac, field) => {
        let value = field.value;
        if(configCheck.includes(field.name)) value = field.checked;

        if(field.name === "theme" && value) value = "vs-dark";
        else if(field.name === "theme") value = "vs";

        if(field.name === 'fontSize') value = +field.value;
        if(field.name === 'wordWrap') value = field.value;

        if(field.value) Object.defineProperty(ac, field.name , { value, writable: true, enumerable: true })
        return ac;
    }, {});

    const editor = getEditor();
    editor.updateOptions(fieldValues);
    localStorage.setItem('editorSettings', JSON.stringify(fieldValues));
    window.preferencesEditorModal.toggle();
    return false;
}

/**
 * Init Preferences Menu
 */
const initPreferences = () => {
    const preferencesEditor = document.getElementById('preferencesEditor');

    window.preferencesEditorModal = new bootstrap.Modal(document.getElementById('preferencesEditorModal'), {
        keyboard: false,
        backdrop: 'static'
    });

    preferencesEditor.addEventListener("click", () => {
        preferencesEditorModal.toggle();
    });
}

/**
 * Download File
 * @param {String} code 
 */
const downloadFile = (code) => {
    const a = document.createElement('a');
    const blob = new Blob([code]);
    a.href = URL.createObjectURL(blob);
    a.download = 'code.js';
    a.click();
}

/**
 * Init Save code menu
 * @param {MonacoEdit} editor 
 */
const initSaveCodeMenu = (editor) => {
    const saveCodeMenu = document.getElementById('saveCodeEditor');

    saveCodeMenu.addEventListener("click", () => {
        downloadFile(editor.getValue());
    });
}

/**
 * Execute All Context Menu
 */
const initContextMenu = (editor) => {
    initAboutMenu();
    initCaptureMenu();
    initPreferences();
    initSaveCodeMenu(editor);
    setPreferenceDefaultValues();
}

/**
 * Enable bootstrap ui
 */
const bootstrapUi = (editor) => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

    const authorLink = document.getElementById('authorLink');
    authorLink.addEventListener("click", () => {
        const r = confirm("You will be redirected to linkedin. are you want to continue ?");
        if (r == true) window.open('https://www.linkedin.com/in/subhendumondal/', '_blank');
    })
    
    initContextMenu(editor);
}

/**
 * Start the script
 */
(function() {
    require.config({ paths: { vs: '/assets/vendor/monaco-editor/min/vs' } });
    feather.replace();

    const codeEditorDiv = document.getElementById("codeEditor");
    const nonEditorArea = document.getElementById("nonEditorArea");
    const result = document.getElementById("result");
    const errorDiv = document.getElementById("error");
    const clearBtn = document.getElementById("clearBtn");
    const runBtn = document.getElementById("run");
    const oPanels = document.getElementsByClassName("oPanle");
    const showTimeForExecution = document.getElementById("showTimeForExecution");

    codeEditorDiv.style.height = (document.body.clientHeight - nonEditorArea.clientHeight - 3) + "px";
    Array.from(oPanels).forEach((oPanle) => oPanle.style.height = (codeEditorDiv.clientHeight / 2) + "px");

    const defaultCode = localStorage.getItem("code") || `\n/**\n* Write your code and\n* hit Ctrl + Enter to execute it\n*/\ninterface Person {\n    name: string,\n    age: number\n}\n\nlet person1: Person = { name: \"John doe\", age: 40 };\n\nconsole.log(person1);`;

    require(['vs/editor/editor.main'], function () {

        let options = {} ;
        if(localStorage.getItem('editorSettings')) options = JSON.parse(localStorage.getItem('editorSettings'));

        const editor = monaco.editor.create(codeEditorDiv, {
            value: defaultCode,
            language: 'typescript',
            automaticLayout: true,
            ...options
        });

        setEditor(editor);

        /**
         * Execution Action
         */
        editor.addAction({
            id: 'ctrlCmd_Enter',
            label: 'Execution Command',
            keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: (ed) => executeCode(editor)
        });

        /**
         * Save Action
         */
        editor.addAction({
            id: 'CTRL_S',
            label: 'Save Command',
            keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S ],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: (ed) => {
                const saveCodeMenu = document.getElementById('saveCodeEditor');
                saveCodeMenu.click();
            }
        });

        /**
         * Detect Change in Monaco EDitor
         */
        // editor.onDidChangeModelContent(e => {});

        runBtn.addEventListener("click", (event) => {
            event.preventDefault();
            executeCode(editor);
        });

        bootstrapUi(editor);
    });

    clearBtn.addEventListener("click", (event) => {
        event.preventDefault();
        result.innerHTML = "";
        showTimeForExecution.innerHTML = "";
    }); 
    
    /**
     * Execute javascript code
     * @param {MonacoEditor} editor 
     */
    const executeCode = (editor) => {
        const tCode = editor.getValue();
        localStorage.setItem('code', tCode);

        /**
         * Convert TypeScript to Javascript
         */
        const convertedJavascript = ts.transpileModule(tCode, { compilerOptions: { module: ts.ModuleKind.CommonJS }});
        const code = convertedJavascript.outputText.replaceAll("console.log", "console.myTestLog");
        
        try {
            var allLog = [];
            console.myTestLog = function() {
                const args = Array.from(arguments);
                if(args.includes(window)) {
                    let indexOf = args.indexOf(window);
                    args.splice(1, indexOf);
                }

                allLog.push(Array.from(arguments));
            }

            Object.prototype.toString = function () {
                return JSON.stringify(this);
            }

            eval = function() {
                throw new Error("eval(...) is not a known function");
            }

            let start = performance.now();
            new Function(code)();
            let end = performance.now();

            const timeTaken = end - start;
            result.innerHTML = allLog.join("<br/>");
            showTimeForExecution.innerHTML = `<em>Executed in <span class="badge bg-secondary">${inHumanReadbleTime(timeTaken)}</span><em>`;
            errorDiv.innerHTML = "";
        }
        catch(err) {
            const errorLine = JSON.stringify(err.stack).split("\\n").shift();
            errorDiv.innerHTML = errorLine.replace("\"", "");
            result.innerHTML = "";
            showTimeForExecution.innerHTML = "";
        }
    }
})();
