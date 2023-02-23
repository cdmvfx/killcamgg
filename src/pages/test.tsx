import { Editor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";
import type { Editor as TinyMCEEditor } from "tinymce";
import parse from "html-react-parser";

const Test = () => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const [content, setContent] = useState<string>("<p>test</p>");

  return (
    <div>
      <div>test</div>
      <Editor
        apiKey="d8niriv801opbhxnynq8zexo3xjm9f8zq48lfq2tnb3jtgry"
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue="<p>This is the initial content of the editor.</p>"
        value={content}
        onEditorChange={setContent}
        init={{
          height: 200,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic strikethrough backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | h1 h2 h3",
          skin: "oxide-dark",
          content_css: "dark",
          content_style: contentStyle,
        }}
      />
      {parse(content)}
    </div>
  );
};

const contentStyle = `
body {
	font-family: -apple-system, BlinkMacSystemFont, 'Inter', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	line-height: 1.4;
	margin: 1rem;
	color: white;
	background-color: #222222;
}

`;

export default Test;
