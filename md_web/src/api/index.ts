import axios from "../request/index";

/**
 * 登录
 * @param {object} params
 * @return {object} 结果
 * @author 楷炫
 */
export function login(params) {
  return axios({ method: "get", url: "/users/login", params });
}

/**
 * 获取文件内容
 * @param {object} params
 * @return {object} 结果
 * @author 楷炫
 */
export function getFile(params) {
  return axios({ method: "get", url: "/file", params });
}

/**
 * 编辑文件
 * @param {object} data
 * @return {object} 结果
 * @author 楷炫
 */
export function editFile(data) {
  return axios({ method: "post", url: "/file", data });
}

/**
 * 导出文件
 * @param {object} id
 * @return {object} 结果
 * @author 楷炫
 */
export function exportFile(id) {
  return axios({
    method: "get",
    url: `/file/export/${id}`,
    responseType: "blob",
  });
}

/**
 * 新增文件
 * @param {object} data
 * @return {object} 结果
 * @author 楷炫
 */
export function addFile(data) {
  return axios({
    method: "POST",
    url: `/file/add`,
    data,
  });
}

/**
 * 删除
 * @param {object} id
 * @return {object} 结果
 * @author 楷炫
 */
export function delFile(id) {
  return axios({
    method: "DELETE",
    url: `/file/${id}`,
  });
}
