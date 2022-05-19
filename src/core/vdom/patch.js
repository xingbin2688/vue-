/**
 * patch修改DOM节点，通过对比两个vnode差异，找到需要更新的节点进行更新，节省性能
 * oldVnode是否存在，不存在使用vnode创建节点并插入视图
 * 存在，oldVnode和vnode是否同一个节点，是更新，不是增加vnode插入到视图旧节点的旁边,删除oldVnode
 * 新增节点
 * 删除节点
 * 更新节点
*/