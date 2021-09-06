
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

        const configCheck = ['lineNumbers', 'roundedSelection', 'scrollBeyondLastLine'];
        if(configCheck.includes(field.name)) {
            field.checked = preselectedPreferences[field.name];
            return;
        }

        if(field.name === 'theme') {
            field.checked = preselectedPreferences[field.name] === "vs-dark" ? true : false;
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

    const configCheck = ['lineNumbers', 'roundedSelection', 'scrollBeyondLastLine', 'theme'];
    const formEl = document.forms.preferencesForm;

    const fieldValues = Object.values(formEl).reduce((ac, field) => {
        let value = field.value;
        if(configCheck.includes(field.name)) value = field.checked;

        if(field.name === "theme" && value) value = "vs-dark";
        else if(field.name === "theme") value = "vs";

        if(field.name === 'fontSize') value = +field.value;

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

    codeEditorDiv.style.height = (document.body.clientHeight - nonEditorArea.clientHeight - 20) + "px";
    Array.from(oPanels).forEach((oPanle) => oPanle.style.height = (codeEditorDiv.clientHeight / 2) + "px");

    const defaultCode = localStorage.getItem("code") || `/**\n* Write your code and\n* hit Ctrl + Enter to execute it\n*/\nconsole.log("Hello Dev");`;

    require(['vs/editor/editor.main'], function () {

        let options = {} ;
        if(localStorage.getItem('editorSettings')) options = JSON.parse(localStorage.getItem('editorSettings'));

        const editor = monaco.editor.create(codeEditorDiv, {
            value: defaultCode,
            language: 'javascript',
            automaticLayout: true,
            ...options
        });

        setEditor(editor);
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
        const code = tCode.replaceAll("console.log", "console.myTestLog");
        
        try {
            var allLog = [];
            console.myTestLog = function() {
                allLog.push(Array.from(arguments));
            }

            Object.prototype.toString = function () {
                return JSON.stringify(this);
            }

            let start = performance.now();
            new Function(code)();
            let end = performance.now();

            const timeTaken = end - start;
            result.innerHTML = allLog.join("<br/>");
            showTimeForExecution.innerHTML = `<em>Its took <span class="badge bg-secondary">${timeTaken.toFixed(2)}</span> ms.<em>`;
            errorDiv.innerHTML = "";
        }
        catch(err) {
            const errorLine = JSON.stringify(err.stack).split("\\n").shift();
            errorDiv.innerHTML = errorLine.replace("\"", "");
            result.innerHTML = "";
        }
    }
})();
