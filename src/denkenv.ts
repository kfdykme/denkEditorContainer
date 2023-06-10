import * as monaco from "monaco-editor";
import initTheme from "./theme/theme";


const initDenkEnv = () => {
  const fakeWindow = window as any;
  fakeWindow.denkMap = new Map();
  fakeWindow.denkSetKeyValue = (key: string, value: any) => {
    fakeWindow.denkMap.set(key, value);
  };
  fakeWindow.denkGetKey = (key: string): any => {
    return fakeWindow.denkMap.get(key);
  };
  fakeWindow.denkAllKeys = (): any => {
    return Array.from(fakeWindow.denkMap.keys());
  };

  fakeWindow.denkSetKeyValue("monaco", monaco);

  const sendIpcMessage = (data: any) => {
    try {
      if (fakeWindow.ipcRenderer) {
        fakeWindow.ipcRenderer(JSON.stringify(data));
      } else if (fakeWindow.webkit) {
        fakeWindow.webkit.messageHandlers.ipcRender.postMessage(data);
      } else {
        console.info(data)
      }
    } catch (err) {
      console.error(err);
    }
  }

  const prepareInjectJs = async () => {
    if (fakeWindow.denkGetKey("prepareInjectJsResolve")) {
      return Promise.reject("already loading");
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("timeout prepareInjectJs"));
      }, 1000);
      fakeWindow.denkSetKeyValue("prepareInjectJsResolve", resolve);
      sendIpcMessage({
        name: "prepareInjectJs",
      });
    });
  };

  fakeWindow.denkSetKeyValue("sendIpcMessage", sendIpcMessage);

  {
    const monaco = fakeWindow.denkGetKey("monaco");
    // Register a new language
    monaco.languages.register({ id: "markdown" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("markdown", {
      tokenizer: {
        root: [
          [/- .*?\[DONE\]/, "custom-done"],
          [/\---/, "custom-title-bar"],
          [/^(title) ?: ?(.*)/, "custom-title-bar"],
          [/^(date) ?: ?(.*)/, "custom-title-bar"],
          [/^(tags) ?: ?(.*)/, "custom-title-bar"],
          [/^#{1,6} .*/, "custom-header"],
          [/- .*? /, "custom-list-item"],
          [/\*\*.*\*\*/, "custom-blod"],
          [/\*.*\*/, "custom-italic"],
          [/\[error.*/, "custom-error"],
          [/\d/, "custom-number"],
          [/\[notice.*/, "custom-notice"],
          [/\[info.*/, "custom-info"],
          [/\[[a-zA-Z 0-9:]+\]/, "custom-date"],
          [/const/, "custom-date"],
          [/".*?"/, "custom-date"],
        ],
      },
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("myCoolTheme", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "custom-done", foreground: "aaaaaa" },
        { token: "custom-info", foreground: "808080" },
        { token: "custom-title-bar", foreground: "808080" },
        { token: "custom-header", foreground: "ffbcd4" },
        { token: "custom-list-item", foreground: "FFA500" },
        { token: "custom-title-bar", foreground: "808080" },
        { token: "custom-blod", foreground: "00aaff", fontStyle: "bold" },
        { token: "custom-italic", foreground: "ffaabb", fontStyle: "italic" },
        { token: "custom-error", foreground: "ff0000", fontStyle: "bold" },
        { token: "custom-number", foreground: "aa0000" },
        { token: "custom-notice", foreground: "FFA500" },
        { token: "custom-date", foreground: "008800" },
      ],
      colors: {
        "editor.foreground": "#000000",
      },
    });

    const initCodeLens = (editor: any) => {};

    const initCommands = (editor: any) => {
      editor.addAction({
        // An unique identifier of the contributed action.
        id: "save",

        // A label of the action that will be presented to the user.
        label: "save!!!",

        // An optional array of keybindings for the action.
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],

        // A precondition for this action.
        precondition: null,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: null,

        contextMenuGroupId: "navigation",

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convenience
        run: function (ed: any) {
          fakeWindow.denkGetKey("sendIpcMessage")({
            name: "editorSave",
          });
        },
      });

      editor.addAction({
        // An unique identifier of the contributed action.
        id: "refresh",

        // A label of the action that will be presented to the user.
        label: "refresh",

        // An optional array of keybindings for the action.
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],

        // A precondition for this action.
        precondition: null,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: null,

        contextMenuGroupId: "navigation",

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convenience
        run: function (ed: any) {
          location.reload();
        },
      });
    };

    fakeWindow.denkSetKeyValue("onEditorCreate", (editor: any) => {
      console.info("onEditorCreate", editor);
      initCodeLens(editor);
      initCommands(editor);
    });

    // Register a completion item provider for the new language
    monaco.languages.registerCompletionItemProvider("markdown", {
      provideCompletionItems: () => {
        var suggestions = [];

        const headerMaxLv = 6;
        let headerPrefix = "";
        for (let x = 1; x <= headerMaxLv; x++) {
          headerPrefix += "#";
          suggestions.push({
            label: "_#" + x,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: headerPrefix + " ${1:header}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Header levele " + x,
          });
        }
        return { suggestions: suggestions };
      },
    });
  }

  fakeWindow.onload = () => {
    console.info("editor window onload()");

    new Promise<void>((resolve, reject) => {
      console.info("wait inject js");
      // fakeWindow.denkSetKeyValue('windowOnloadResolve', resolve)
      resolve();
    })
      .then((res) => {})
      .finally(() => {
        prepareInjectJs();
      });
  };

  for (let x in window) {
    if (x.startsWith("denk")) {
      console.info(x);
    }
  }
  // console.info(window)
  // ["monaco", "clearEditor", "createEditorFunc", "sendIpcMessage", "windowOnloadResolve", "prepareInjectJsResolve"]
  console.info(fakeWindow.denkAllKeys());

  const getOption = (filePath = "") => {
    let myOption: any = {};
    if (filePath.endsWith(".js")) {
      myOption.language = "javascript";
    }

    if (filePath.endsWith(".md")) {
      myOption.theme = "myCoolTheme";
      myOption.language = "markdown";
    }

    return {
      language: "javascript",
      ...myOption,
    };
  };

  const getEditor = (filePath = "") => {
    const id = "editor" + filePath;
    let editor = fakeWindow.denkGetKey(id);
    let editorView: any = document.getElementById(id);
    if (!editor) {
      const holder = document.getElementById("editor_container_holder");
      if (!holder) {
        throw new Error("error");
      }
      if (!editorView) {
        editorView = document.createElement("div");
        editorView.style.width = "100%";
        editorView.style.height = "100%";
        editorView.id = id;
        editorView.className = "editor_view";
        holder.appendChild(editorView);
      }
      const monaco = fakeWindow.denkGetKey("monaco");
      editor = monaco.editor.create(editorView, getOption(filePath));
      fakeWindow.denkSetKeyValue(id, editor);

      const onEditorCreate = fakeWindow.denkGetKey("onEditorCreate");
      if (onEditorCreate && typeof onEditorCreate === "function") {
        onEditorCreate(editor);
      }
    }
    for (
      let x = 0;
      x < document.getElementsByClassName("editor_view").length;
      x++
    ) {
      (document.getElementsByClassName("editor_view")[x] as any).style.display = "none";
    }
    editorView.style.display = "";

    return editor;
  };

  fakeWindow.denkSetKeyValue(
    "insertIntoEditor",
    (content: string, filePath: string) => {
      console.info("insertIntoEditor", content, filePath);
      getEditor(filePath).setValue(content);
    }
  );

  initTheme()
}

export default initDenkEnv
