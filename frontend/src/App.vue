<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElButton, ElCard, ElInput, ElForm, ElFormItem } from 'element-plus';
import { useUserStore } from './store/user';
import request from './utils/request';

// 使用用户store
const userStore = useUserStore();

// 应用名称
const appName = import.meta.env.VITE_APP_NAME;

// 示例表单数据
const formData = ref({
  name: '',
  value: 0
});

// 示例数据列表
const exampleList = ref<any[]>([]);

// 初始化加载用户信息
onMounted(() => {
  userStore.loadUserInfo();
  fetchExamples();
});

// 请求示例数据
const fetchExamples = async () => {
  try {
    const response = await request.get('/example/');
    exampleList.value = Array.isArray(response) ? response : [];
  } catch (error) {
    ElMessage.error('获取示例数据失败');
    console.error('获取示例数据失败:', error);
  }
};

// 提交表单
const submitForm = async () => {
  if (!formData.value.name || formData.value.value <= 0) {
    ElMessage.warning('请填写有效的表单数据');
    return;
  }

  try {
    await request.post('/example/', formData.value);
    ElMessage.success('示例数据创建成功');

    // 重新获取列表数据
    fetchExamples();

    // 重置表单
    formData.value = {
      name: '',
      value: 0
    };
  } catch (error) {
    ElMessage.error('创建示例数据失败');
    console.error('创建示例数据失败:', error);
  }
};

// 模拟登录
const login = () => {
  userStore.login({
    id: 'user123',
    name: '管理员',
    avatar: 'https://picsum.photos/id/1/200/200'
  });
  ElMessage.success('登录成功');
};

// 模拟登出
const logout = () => {
  userStore.logout();
  ElMessage.success('登出成功');
};
</script>

<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">{{ appName }}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">首页</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">示例</a>
            </li>
          </ul>
          <div class="d-flex">
            <div v-if="userStore.isLoggedIn" class="me-3 text-white">
              欢迎，{{ userStore.name }}
            </div>
            <ElButton v-if="userStore.isLoggedIn" type="danger" @click="logout">
              登出
            </ElButton>
            <ElButton v-else type="primary" @click="login">
              登录
            </ElButton>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="container mt-4">
      <div class="row">
        <!-- 左侧表单 -->
        <div class="col-md-6">
          <ElCard title="创建示例数据">
            <ElForm :model="formData" label-width="100px">
              <ElFormItem label="名称">
                <ElInput v-model="formData.name" placeholder="请输入名称" />
              </ElFormItem>
              <ElFormItem label="值">
                <ElInput v-model.number="formData.value" placeholder="请输入数值" type="number" />
              </ElFormItem>
              <ElFormItem>
                <ElButton type="primary" @click="submitForm">提交</ElButton>
              </ElFormItem>
            </ElForm>
          </ElCard>
        </div>

        <!-- 右侧列表 -->
        <div class="col-md-6">
          <ElCard title="示例数据列表">
            <div v-if="exampleList.length === 0" class="text-center text-muted py-4">
              暂无数据
            </div>
            <div v-else>
              <div v-for="item in exampleList" :key="item.id" class="mb-3 p-3 border rounded">
                <div class="font-weight-bold">{{ item.name }}</div>
                <div>值: {{ item.value }}</div>
                <div>状态: {{ item.processed ? '已处理' : '未处理' }}</div>
              </div>
            </div>
          </ElCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}
</style>
