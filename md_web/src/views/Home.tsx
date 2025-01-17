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
  Tabs,
} from "antd";
import {
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  FileMarkdownOutlined,
  EditOutlined,
  EyeOutlined,
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
export default function Home() {
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
      console.log(132);

      const res = file.name.split(".").pop() === "md";

      if (!res) message.error("仅支持上传文件后缀是.md的文件!");
      return res;
    },
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name}导入成功!`);
        loadUser();

        Modal.destroyAll();
      }
    },
    onDrop(e) {
      const res = e.dataTransfer.files[0].name.split(".").pop() === "md";

      if (!res) message.error("仅支持上传文件后缀是.md的文件!");
      return res;
    },
  });

  const bMobile = Boolean(
    navigator.userAgent.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );

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
      editFile({ value, id: currentId }).then((res) => {});
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
      message.success(`创建文件成功!`);
      loadUser();
    });
  }

  function del(id) {
    return delFile(id).then((res) => {
      message.success(`删除文件成功!`);

      loadUser();
    });
  }

  const editorRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (previewRef.current?.children[1])
      previewRef.current = previewRef.current.children[1];
  }, [previewRef]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    editorRef.current.onDidScrollChange((e) => {
      if (previewRef.current) {
        previewRef.current.scrollTop =
          previewRef.current.scrollHeight * (e.scrollTop / e.scrollHeight);
      }
    });
  }

  const [bodyHeight, setBodyHeight] = useState(0);
  const headerRef = useRef(null);
  useEffect(() => {
    resize();
  }, [headerRef]);

  function resize() {
    setBodyHeight(
      (1 - headerRef.current.offsetHeight / window.innerHeight) * 100
    );
  }

  window.onresize = () => {
    resize();
  };

  return (
    <div
      style={{ padding: "0 8px", backgroundColor: "#F0F2F5" }}
      onDragOver={() => {
        Modal.info({
          closable: true,
          maskClosable: true,
          icon: null,
          okText: "取消",
          centered: true,
          width: "50vw",
          content: (
            <div style={{ height: "50vh" }}>
              <Upload.Dragger {...uploadProps} style={{ marginTop: "24px" }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">把文件拖到这里以导入</p>
              </Upload.Dragger>
            </div>
          ),
        });
      }}
    >
      <div
        style={{ padding: "8px 0", display: "flex", alignItems: "center" }}
        ref={headerRef}
      >
        <label style={{ marginRight: "8px" }}>
          编辑器主题:
          <Switch
            size="small"
            checkedChildren="明亮"
            unCheckedChildren="黑暗"
            checked={checked}
            onClick={() => setChecked((b) => !b)}
          />
        </label>
        <Button
          size="small"
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
            size="small"
            icon={<ImportOutlined />}
            type="primary"
            style={{ marginRight: "8px" }}
          >
            导入
          </Button>
        </Upload>
        <Button
          onClick={exportHandle}
          icon={<ExportOutlined />}
          type="primary"
          size="small"
        >
          导出
        </Button>
      </div>

      {!bMobile ? (
        <Row
          justify="space-between"
          style={{ height: `calc(${bodyHeight}vh - 24px)` }}
        >
          <Col span={3} style={{ marginBottom: "16px", height: "100%" }}>
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
                            onClick={async () => {
                              await del(v.id);
                              if (currentId === v.id) setCurrentId(0);
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
          <Col span={10} style={{ marginBottom: "16px", height: "100%" }}>
            <Card
              title={
                currentId !== 0
                  ? files.find((v) => v.id === currentId).name
                  : "README.md(只读)"
              }
              bordered={false}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              styles={{
                body: {
                  padding: "0",
                  flex: 1,
                  overflowY: "auto",
                },
              }}
              ref={previewRef}
            >
              <Editor
                disabled
                width="100%"
                path={currentId}
                defaultLanguage="markdown"
                value={currentValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                loading="加载中..."
                options={{
                  theme: checked ? "light" : "vs-dark",
                  readOnly: currentId === 0,
                  readOnlyMessage: {
                    value: "这是内置的文件，是不可编辑的，请新建或导入您的文件",
                  },
                  mouseWheelZoom: true,
                }}
              />
            </Card>
          </Col>
          <Col span={10} style={{ marginBottom: "16px", height: "100%" }}>
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
              ref={previewRef}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: marked.parse(currentValue),
                }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Tabs
          style={{
            height: `calc(${bodyHeight}vh - 24px)`,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "8px",
          }}
          size="small"
          type="card"
          items={[
            {
              forceRender: true,
              key: 1,
              label: "你的文件",
              children: (
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
                              onClick={async () => {
                                await del(v.id);
                                if (currentId === v.id) setCurrentId(0);
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
              ),
              icon: <FileMarkdownOutlined />,
            },
            {
              forceRender: true,
              key: 2,
              label: "编辑",
              children: (
                <Editor
                  disabled
                  width="100%"
                  path={currentId}
                  defaultLanguage="markdown"
                  value={currentValue}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  loading="加载中..."
                  options={{
                    theme: checked ? "light" : "vs-dark",
                    readOnly: currentId === 0,
                    readOnlyMessage: {
                      value:
                        "这是内置的文件，是不可编辑的，请新建或导入您的文件",
                    },
                    mouseWheelZoom: true,
                  }}
                />
              ),
              icon: <EditOutlined />,
            },
            {
              forceRender: true,
              key: 3,
              label: "实时预览",
              children: (
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(currentValue),
                  }}
                />
              ),
              icon: <EyeOutlined />,
            },
          ]}
        />
      )}
    </div>
  );
}
