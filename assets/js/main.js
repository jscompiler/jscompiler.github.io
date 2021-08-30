(function() {
    var myTextarea = document.getElementById("code");
    var codeEditorDiv = document.getElementsByClassName("codeEditor");
    var result = document.getElementById("result");
    var errorDiv = document.getElementById("error");

    var editor = CodeMirror.fromTextArea(myTextarea, {
        lineNumbers: true,
        value: myTextarea.innerHtml,
        mode:  "javascript",
        htmlMode: true,
    });
    
    const defaultCode = localStorage.getItem("code") || `/**
* Write your code and
* hit enter to execute it
*/
console.log("Hello Dev");`;

    editor.setValue(defaultCode);
    editor.setSize(codeEditorDiv[0].clientWidth, codeEditorDiv[0].clientHeight - 2);

    editor.on('change', (editor) => {
        localStorage.setItem('code', editor.doc.getValue());
        const code = editor.doc.getValue().replaceAll("console.log", "console.myTestLog");

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
})();