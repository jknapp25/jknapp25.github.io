import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Post from "./Post";
import Job from "./Job";
import Project from "./Project";
import PostEditor from "./PostEditor";
import JobEditor from "./JobEditor";
import ProjectEditor from "./ProjectEditor";
import { API, graphqlOperation } from "aws-amplify";
import {
  createPost,
  createJob,
  createProject,
  updatePost,
  updateJob,
  updateProject,
} from "../graphql/mutations";
import * as queries from "../graphql/queries";
export default AddItem;

function AddItem() {
  const [items, setItems] = useState([]);
  const [itemType, setItemType] = useState("post");
  const [editingItemId, setEditingItemId] = useState("");

  async function handleCreate(type, data) {
    if (type === "post") {
      await API.graphql(graphqlOperation(createPost, { input: data }));
    }
    if (type === "job") {
      await API.graphql(graphqlOperation(createJob, { input: data }));
    }
    if (type === "project") {
      await API.graphql(graphqlOperation(createProject, { input: data }));
    }
  }

  async function handleUpdate(type, data) {
    if (type === "post") {
      await API.graphql(graphqlOperation(updatePost, { input: data }));
    }
    if (type === "job") {
      await API.graphql(graphqlOperation(updateJob, { input: data }));
    }
    if (type === "project") {
      await API.graphql(graphqlOperation(updateProject, { input: data }));
    }
  }

  useEffect(() => {
    async function fetchData() {
      const postsData = await API.graphql({ query: queries.listPosts });
      const posts = postsData.data.listPosts.items.map((post) => ({
        ...post,
        type: "post",
      }));

      const jobsData = await API.graphql({ query: queries.listJobs });
      const jobs = jobsData.data.listJobs.items.map((job) => ({
        ...job,
        type: "job",
      }));

      const projectsData = await API.graphql({ query: queries.listProjects });
      const projects = projectsData.data.listProjects.items.map((project) => ({
        ...project,
        type: "project",
      }));

      const fetchedItems = [...posts, ...jobs, ...projects];

      setItems(fetchedItems);
    }
    fetchData();
  }, []);

  return (
    <>
      {["post", "job", "project"].map((type) => (
        <Button
          key={type}
          variant={type === itemType ? "primary" : "secondary"}
          className="mr-2 mt-4"
          size="lg"
          onClick={() => setItemType(type)}
        >
          {type === "post" ? "Write a post" : null}
          {type === "job" ? "Add work experience" : null}
          {type === "project" ? "Start a project" : null}
        </Button>
      ))}

      <div className="mb-4" />

      {itemType === "post" ? (
        <PostEditor
          id={editingItemId}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      ) : null}
      {itemType === "job" ? <JobEditor onCreate={handleCreate} /> : null}
      {itemType === "project" ? (
        <ProjectEditor onCreate={handleCreate} />
      ) : null}
      <div className="mb-5" />
      {items.length > 0 ? (
        items.map((item, i) => {
          if (item.type === "post")
            return (
              <Post
                key={i}
                setEditingItemId={setEditingItemId}
                post={item}
                showEdit={true}
              />
            );
          if (item.type === "job") return <Job key={i} job={item} />;
          if (item.type === "project")
            return <Project key={i} project={item} />;
          return null;
        })
      ) : (
        <div>No items</div>
      )}
    </>
  );
}
