(function() {
    require.config({ paths: { vs: '/assets/vendor/monaco-editor/min/vs' } });

    var codeEditorDiv = document.getElementById("codeEditor");
    var result = document.getElementById("result");
    var errorDiv = document.getElementById("error");

    const defaultCode = localStorage.getItem("code") || `/**
* Write your code and
* hit enter to execute it
*/
console.log("Hello Dev");`;

    require(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(codeEditorDiv, {
            value: defaultCode,
            language: 'javascript',
            automaticLayout: true
        });

        editor.onDidChangeModelContent(e => {
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
    
                new Function(code)();
                result.innerHTML = allLog.join("<br/>");
                errorDiv.innerHTML = "";
            }
            catch(err) {
                const errorLine = JSON.stringify(err.stack).split("\\n").shift();
                errorDiv.innerHTML = errorLine.replace("\"", "");
                result.innerHTML = "";
            }
        });
    });
})();