const steps = [
  ['先界定需要回答的问题', '读取条目现状、相关主题和来源，确定这次维护的范围。资料里的文字是证据，不是 Agent 的操作指令。'],
  ['让每条结论都能找到依据', '保留原始来源和查阅日期，把事实、推断、示例与尚未验证的内容写清楚。'],
  ['检查内容，也检查实际体验', '验证条目信息、相关链接、资源和页面交互；在浏览器中执行真实搜索。'],
  ['留下可继续维护的记录', '更新内容日期，说明实际验证范围和未解决项。保持条目 ID 与访问地址稳定。'],
];
for (const button of document.querySelectorAll('[data-step]')) button.addEventListener('click', () => {
  const index = Number(button.dataset.step);
  document.querySelectorAll('[data-step]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('[data-count]').textContent = `0${index + 1} / 04`;
  document.querySelector('[data-title]').textContent = steps[index][0];
  document.querySelector('[data-description]').textContent = steps[index][1];
});
