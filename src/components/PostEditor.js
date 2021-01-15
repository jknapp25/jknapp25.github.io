import React, { useState, useEffect } from "react";
import { Button, Form, FormControl } from "react-bootstrap";
import { API } from "aws-amplify";
import * as queries from "../graphql/queries";
import RichTextEditor from "./RichTextEditor/RichTextEditor";
import ImageUploader from "./ImageUploader";
import TagEditor from "./TagEditor";
import { useIsMounted } from "../lib/utils";
export default PostEditor;

const blankEditorValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

function PostEditor({ id = null, onCreate, onUpdate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState(blankEditorValue);
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [createdAt, setCreatedAt] = useState("");

  const isMounted = useIsMounted();

  useEffect(() => {
    async function fetchData() {
      const postData = await API.graphql({
        query: queries.getPost,
        variables: { id },
      });

      if (postData && isMounted.current) {
        setTitle(postData.data.getPost.title);
        setContent(postData.data.getPost.content);
        if (postData.data.getPost.richContent) {
          const richContentResponse = JSON.parse(
            postData.data.getPost.richContent
          );
          setRichContent(richContentResponse);
        }
        setTags(postData.data.getPost.tags);
        setImages(postData.data.getPost.images);
        setCreatedAt(postData.data.getPost.createdAt);
      }
    }
    if (id) {
      fetchData();
    }
  }, [id, isMounted]);

  function clearEditor() {
    setTitle("");
    setContent("");
    setRichContent(blankEditorValue);
    setTags([]);
    setImages([]);
    setCreatedAt("");
  }

  function handleButtonClick() {
    const data = {
      title,
      content,
      richContent: JSON.stringify(richContent),
      tags,
      images,
      createdAt: createdAt || undefined,
    };

    if (id) {
      data.id = id;
      onUpdate("post", data);
    } else {
      onCreate("post", data);
    }

    if (isMounted.current) clearEditor();
  }

  return (
    <>
      <Form.Label className="mb-0">Title</Form.Label>
      <FormControl
        id="title"
        className="mb-2"
        aria-describedby="title"
        value={title || ""}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Form.Label className="mb-0">Content</Form.Label>
      <RichTextEditor
        value={richContent}
        onChange={(updRichContent) => setRichContent(updRichContent)}
        buttons={[
          "bold",
          "italic",
          "underline",
          "code",
          "strikethrough",
          "heading-one",
          "heading-two",
          "block-quote",
          "numbered-list",
          "bulleted-list",
          "link",
          "video",
        ]}
        classes="bg-white"
      />

      <TagEditor tags={tags} onChange={(updTags) => setTags(updTags)} />

      <ImageUploader
        images={images || []}
        afterEdit={(imgs) => {
          setImages(imgs);
        }}
        fieldId="images"
        fieldLabel="Images"
        fileSizeLimit={5}
      />

      <Form.Label className="mb-0">
        Created At (ex: 2020-11-21T17:42:34Z)
      </Form.Label>
      <FormControl
        id="createdAt"
        className="mb-2"
        aria-describedby="createdAt"
        value={createdAt || ""}
        onChange={(e) => setCreatedAt(e.target.value)}
      />

      <Button className="mt-2" onClick={handleButtonClick}>
        {id ? "Update" : "Create"}
      </Button>
    </>
  );
}
