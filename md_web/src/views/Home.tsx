import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import * as marked from "marked";
import * as monaco from "monaco-editor";
import _ from "lodash";

import Editor, { loader } from "@monaco-editor/react";

loader.config({ monaco });

import {
  Button,
  message,
  Upload,
  Radio,
  Space,
  Card,
  Tooltip,
  Switch,
  Col,
  Row,
  Modal,
  Input,
  Popover,
} from "antd";
import {
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { baseUrl } from "../config/index";
import {
  login,
  getFile,
  editFile,
  exportFile,
  addFile,
  delFile,
} from "../api/index";
export default function Tree() {
  const [files, setFiles] = useState([]);
  const [currentId, setCurrentId] = useState(0);
  const [currentValue, setCurrentValue] = useState("");
  const [checked, setChecked] = useState(false);
  const newFileName = useRef(null);

  const [uploadProps, setUploadProps] = useState({
    name: "file",
    accept: ".md",
    action: `${baseUrl}/upload`,
    headers: {},
    data: {},
    showUploadList: false,
    beforeUpload(file) {
      const res = file.name.split(".").pop() === "md";
      if (!res) message.error("仅支持上传后缀是.md的文件类型!");
      return res;
    },
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name}上传成功!`);
        loadUser();
      }
    },
  });

  useEffect(() => {
    if (!localStorage.getItem("user_id")) {
      localStorage.setItem("user_id", uuidv4());
    }

    setUploadProps((p) => ({
      ...p,
      data: { user_id: localStorage.getItem("user_id") },
    }));
    loadUser();
  }, []);

  function loadUser() {
    login({ user_id: localStorage.getItem("user_id") }).then((res) => {
      console.log(res);

      setFiles(() => [
        {
          id: 0,
          name: "README.md",
          url: "/xiaokaixuan.md",
        },
        ...res.data.user.files,
      ]);
    });
  }

  useEffect(() => {
    if (currentId || currentId === 0) {
      getFile({ id: currentId }).then((res) => {
        if (res.data.ok === 1) setCurrentValue(res.data.value);
      });
    }
  }, [currentId]);

  function fileChange(v) {
    setCurrentId(v.target.value);
  }

  const EditorChangeDebounced = _.debounce(
    function (value) {
      setCurrentValue(value);
      if (currentId !== 0) {
        editFile({ value, id: currentId }).then((res) => {
          console.log(res);
        });
      }
    },
    300,
    { maxWait: 1000 }
  );

  function handleEditorChange(value, event) {
    EditorChangeDebounced(value);
  }

  function exportHandle() {
    exportFile(currentId).then((res) => {
      const blob = new Blob([res.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = files.find((v) => v.id == currentId).name;
      a.href = blobUrl;
      a.click();
    });
  }

  function add() {
    return addFile({
      name: newFileName.current.input.value + ".md",
      user_id: localStorage.getItem("user_id"),
    }).then((res) => {
      console.log(res);
      message.success(`创建文件成功!`);
      loadUser();
    });
  }

  function del(id) {
    delFile(id).then((res) => {
      message.success(`删除文件成功!`);

      loadUser();
    });
  }

  return (
    <div style={{ padding: "0 8px", backgroundColor: "#F0F2F5" }}>
      <div style={{ padding: "8px 0", display: "flex", alignItems: "center" }}>
        <label style={{ marginRight: "8px" }}>
          编辑器主题：
          <Switch
            checkedChildren="明亮"
            unCheckedChildren="黑暗"
            checked={checked}
            onClick={() => setChecked((b) => !b)}
          />{" "}
        </label>
        <Button
          onClick={() => {
            const modal = Modal.info({
              closable: true,
              maskClosable: true,
              title: `为你新建的文件取个名字`,
              footer: null,
              content: (
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    addonAfter=".md"
                    allowClear
                    ref={newFileName}
                    onPressEnter={async () => {
                      await add();
                      modal.destroy();
                    }}
                  />
                  <Button
                    type="primary"
                    onClick={async () => {
                      await add();
                      modal.destroy();
                    }}
                  >
                    确定
                  </Button>
                </Space.Compact>
              ),

              afterClose() {
                console.log("close");
              },
            });
          }}
          icon={<PlusOutlined />}
          type="primary"
          style={{ marginRight: "8px" }}
        >
          新建
        </Button>
        <Upload {...uploadProps}>
          <Button
            icon={<ImportOutlined />}
            type="primary"
            style={{ marginRight: "8px" }}
          >
            导入
          </Button>
        </Upload>
        <Button onClick={exportHandle} icon={<ExportOutlined />} type="primary">
          导出
        </Button>
      </div>

      <Row justify="space-between">
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={3}
          style={{ marginBottom: "16px", height: "90vh" }}
        >
          <Card
            title="你的文件"
            bordered={false}
            style={{
              width: "100%",
              height: "100%",
              marginRight: "8px",
              display: "flex",
              flexDirection: "column",
            }}
            styles={{
              body: {
                padding: "8px",
                flex: 1,
                overflowY: "auto",
              },
            }}
          >
            <Radio.Group
              onChange={fileChange}
              value={currentId}
              buttonStyle="solid"
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {files.map((v) => (
                  <Popover
                    style={{ width: "100px" }}
                    key={v.id}
                    content={
                      <>
                        <span style={{ marginRight: "1em" }}>{v.name}</span>
                        <Button
                          disabled={v.id === 0}
                          onClick={() => {
                            del(v.id);
                          }}
                          icon={<DeleteOutlined />}
                          type="primary"
                          danger
                        >
                          删除
                        </Button>
                      </>
                    }
                  >
                    <Radio.Button value={v.id} style={{ width: "100%" }}>
                      {v.name}
                    </Radio.Button>
                  </Popover>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={10}
          style={{ marginBottom: "16px", height: "90vh" }}
        >
          <div
            style={{
              width: "100%",
              boxShadow: "3px 3px 8px 2px #dedede",
              marginRight: "8px",
              borderRadius: "4px",
              height: "100%",
            }}
          >
            <Editor
              disabled
              width="100%"
              height="90vh"
              theme={checked ? "light" : "vs-dark"}
              path={currentId}
              defaultLanguage="markdown"
              value={currentValue}
              onChange={handleEditorChange}
              loading="加载中..."
            />
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={10}
          style={{ marginBottom: "16px", height: "90vh" }}
        >
          <Card
            title="效果预览"
            bordered={false}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            styles={{
              body: {
                padding: "8px",
                flex: 1,
                overflowY: "auto",
              },
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(currentValue),
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
