<template>
  <div class="admin-dashboard">
    <!-- 顶部导航 -->
    <div class="admin-header">
      <div class="header-left">
        <h1 class="dashboard-title">
          <i class="fas fa-shield-alt"></i>
          <span class="title-text">管理中心</span>
        </h1>
      </div>
      <div class="header-right">
        <span class="admin-info">
          <i class="fas fa-user-crown"></i>
          <span class="admin-email">{{ userStore.user?.email }}</span>
        </span>
        <ElButton @click="handleLogout" type="danger" size="small" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span class="logout-text">退出</span>
        </ElButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.total_users }}</h3>
          <p>总用户数</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon active">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.active_users }}</h3>
          <p>活跃用户</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon packages">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.total_packages }}</h3>
          <p>总订阅数</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon keys">
          <i class="fas fa-key"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.total_api_keys }}</h3>
          <p>用户Key</p>
        </div>
      </div>
    </div>

    <!-- 移动端菜单切换按钮 -->
    <div class="mobile-menu-toggle" @click="toggleMobileMenu">
      <i class="fas fa-bars"></i>
    </div>

    <!-- 主要功能区域 -->
    <div class="main-content">
      <!-- 左侧菜单 -->
      <div class="admin-sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
        <div class="sidebar-header">
          <h3>管理菜单</h3>
          <div class="close-menu" @click="closeMobileMenu">
            <i class="fas fa-times"></i>
          </div>
        </div>
        <ElMenu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <ElMenuItem index="users">
            <i class="fas fa-users"></i>
            <span>用户管理</span>
          </ElMenuItem>
          <ElMenuItem index="packages">
            <i class="fas fa-box"></i>
            <span>订阅管理</span>
          </ElMenuItem>
          <ElMenuItem index="login-history">
            <i class="fas fa-history"></i>
            <span>登录历史</span>
          </ElMenuItem>
          <ElMenuItem index="admin-ops">
            <i class="fas fa-clipboard-list"></i>
            <span>操作记录</span>
          </ElMenuItem>
          <ElMenuItem index="statistics">
            <i class="fas fa-chart-bar"></i>
            <span>统计报表</span>
          </ElMenuItem>
        </ElMenu>
      </div>

      <!-- 移动端遮罩层 -->
      <div class="mobile-overlay" :class="{ 'active': mobileMenuOpen }" @click="closeMobileMenu"></div>

      <!-- 右侧内容区 -->
      <div class="admin-content">
        <!-- 用户管理 -->
        <div v-if="activeMenu === 'users'" class="content-section">
          <div class="section-header">
            <h2>用户管理</h2>
            <ElButton type="primary" @click="refreshUsers">
              <i class="fas fa-refresh"></i>
              刷新
            </ElButton>
          </div>

          <div class="table-responsive">
            <ElTable
              :data="users"
              style="width: 100%"
              v-loading="loading.users"
              :row-class-name="tableRowClassName"
              class="responsive-table"
            >
              <ElTableColumn prop="email" label="邮箱" min-width="200" />
              <ElTableColumn prop="role" label="角色" width="100">
                <template #default="scope">
                  <ElTag :type="scope.row.role === 'admin' ? 'danger' : 'info'" size="small">
                    {{ scope.row.role === 'admin' ? '管理员' : '用户' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="is_active" label="状态" width="80">
                <template #default="scope">
                  <ElTag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
                    {{ scope.row.is_active ? '激活' : '禁用' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="total_api_keys" label="用户Key" width="80" />
              <ElTableColumn prop="created_at" label="注册时间" width="160">
                <template #default="scope">
                  <span class="date-text">{{ formatDateTime(scope.row.created_at) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="180" fixed="right">
                <template #default="scope">
                  <div class="action-buttons">
                    <ElButton
                      size="small"
                      :type="scope.row.is_active ? 'warning' : 'success'"
                      @click="toggleUserStatus(scope.row)"
                      class="action-btn"
                    >
                      <i class="fas fa-power-off"></i>
                      <span class="btn-text">{{ scope.row.is_active ? '禁用' : '激活' }}</span>
                    </ElButton>
                    <ElButton size="small" @click="viewUserDetail(scope.row)" class="action-btn">
                      <i class="fas fa-eye"></i>
                      <span class="btn-text">详情</span>
                    </ElButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>

          <div class="pagination-wrapper">
            <ElPagination
              v-model:current-page="userPagination.page"
              v-model:page-size="userPagination.pageSize"
              :total="userPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleUserPageSizeChange"
              @current-change="handleUserPageChange"
            />
          </div>
        </div>

        <!-- 订阅管理 -->
        <div v-if="activeMenu === 'packages'" class="content-section">
          <div class="section-header">
            <h2>订阅管理</h2>
            <div class="header-actions">
              <ElButton type="primary" @click="showCreatePackageDialog">
                <i class="fas fa-plus"></i>
                新增订阅
              </ElButton>
              <ElButton @click="refreshPackages">
                <i class="fas fa-refresh"></i>
                刷新
              </ElButton>
            </div>
          </div>

          <div class="table-responsive">
            <ElTable
              :data="packages"
              style="width: 100%"
              v-loading="loading.packages"
              class="responsive-table"
            >
              <ElTableColumn prop="package_name" label="订阅名称" min-width="150">
                <template #default="scope">
                  <ElButton type="text" @click="viewSubscriptionDetail(scope.row)" class="package-name-btn">
                    {{ scope.row.package_name }}
                  </ElButton>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="package_code" label="代码" width="100" />
              <ElTableColumn prop="price" label="价格" width="80">
                <template #default="scope">
                  <span class="price-text">¥{{ scope.row.price }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="credits" label="积分" width="80" />
              <ElTableColumn prop="duration_days" label="时长" width="80">
                <template #default="scope">
                  <span class="duration-text">{{ scope.row.duration_days }}天</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="is_active" label="状态" width="80">
                <template #default="scope">
                  <ElTag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
                    {{ scope.row.is_active ? '激活' : '禁用' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="200" fixed="right">
                <template #default="scope">
                  <div class="action-buttons">
                    <ElButton size="small" @click="editPackage(scope.row)" class="action-btn">
                      <i class="fas fa-edit"></i>
                      <span class="btn-text">编辑</span>
                    </ElButton>
                    <ElButton
                      size="small"
                      :type="scope.row.is_active ? 'warning' : 'success'"
                      @click="togglePackageStatus(scope.row)"
                      class="action-btn"
                    >
                      <i class="fas fa-power-off"></i>
                      <span class="btn-text">{{ scope.row.is_active ? '禁用' : '激活' }}</span>
                    </ElButton>
                    <ElButton size="small" type="danger" @click="deletePackage(scope.row)" class="action-btn">
                      <i class="fas fa-trash"></i>
                      <span class="btn-text">删除</span>
                    </ElButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </div>

        <!-- 其他菜单项的占位内容 -->
        <div v-if="activeMenu === 'login-history'" class="content-section">
          <div class="section-header">
            <h2>登录历史</h2>
          </div>
          <div class="placeholder-content">
            <i class="fas fa-history fa-3x"></i>
            <p>登录历史功能正在开发中...</p>
          </div>
        </div>

        <div v-if="activeMenu === 'admin-ops'" class="content-section">
          <div class="section-header">
            <h2>管理员操作记录</h2>
          </div>
          <div class="placeholder-content">
            <i class="fas fa-clipboard-list fa-3x"></i>
            <p>操作记录功能正在开发中...</p>
          </div>
        </div>

        <div v-if="activeMenu === 'statistics'" class="content-section">
          <div class="section-header">
            <h2>统计报表</h2>
          </div>
          <div class="placeholder-content">
            <i class="fas fa-chart-bar fa-3x"></i>
            <p>统计报表功能正在开发中...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建套餐对话框 -->
    <ElDialog
      v-model="packageDialog.visible"
      :title="packageDialog.isEdit ? '编辑订阅' : '新增订阅'"
      width="500px"
    >
      <ElForm :model="packageForm" :rules="packageRules" ref="packageFormRef">
        <ElFormItem label="订阅代码" prop="package_code">
          <ElInput v-model="packageForm.package_code" placeholder="输入订阅代码" />
        </ElFormItem>
        <ElFormItem label="订阅名称" prop="package_name">
          <ElInput v-model="packageForm.package_name" placeholder="输入订阅名称" />
        </ElFormItem>
        <ElFormItem label="订阅描述" prop="description">
          <ElInput v-model="packageForm.description" type="textarea" placeholder="输入订阅描述" />
        </ElFormItem>
        <ElFormItem label="端点" prop="endpoint">
          <ElInput v-model="packageForm.endpoint" placeholder="输入服务端点" />
        </ElFormItem>
        <ElFormItem label="价格" prop="price">
          <ElInputNumber v-model="packageForm.price" :min="0" :precision="2" />
        </ElFormItem>
        <ElFormItem label="积分" prop="credits">
          <ElInputNumber v-model="packageForm.credits" :min="1" />
        </ElFormItem>
        <ElFormItem label="时长(天)" prop="duration_days">
          <ElInputNumber v-model="packageForm.duration_days" :min="1" />
        </ElFormItem>
        <ElFormItem label="排序" prop="sort_order">
          <ElInputNumber v-model="packageForm.sort_order" :min="0" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="packageDialog.visible = false">取消</ElButton>
        <ElButton type="primary" @click="savePackage" :loading="loading.packageSave">
          保存
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElButton, ElTable, ElTableColumn, ElTag, ElPagination,
  ElMenu, ElMenuItem, ElDialog, ElForm, ElFormItem,
  ElInput, ElInputNumber, ElMessage, ElMessageBox
} from 'element-plus'
import { useUserStore } from '../../store/user'
import request from '../../utils/request'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const activeMenu = ref('users')
const mobileMenuOpen = ref(false)
const statistics = ref({
  total_users: 0,
  active_users: 0,
  banned_users: 0,
  admin_users: 0,
  total_api_keys: 0,
  active_api_keys: 0,
  total_packages: 0,
  active_packages: 0
})

const loading = reactive({
  users: false,
  packages: false,
  statistics: false,
  packageSave: false
})

const users = ref([])
const packages = ref([])

const userPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const packageDialog = reactive({
  visible: false,
  isEdit: false
})

const packageForm = reactive({
  package_code: '',
  package_name: '',
  description: '',
  endpoint: '',
  price: 0,
  credits: 0,
  duration_days: 30,
  sort_order: 0
})

const packageFormRef = ref()

const packageRules = {
  package_code: [
    { required: true, message: '请输入套餐代码', trigger: 'blur' }
  ],
  package_name: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  credits: [
    { required: true, message: '请输入积分', trigger: 'blur' }
  ],
  duration_days: [
    { required: true, message: '请输入时长', trigger: 'blur' }
  ]
}

// 方法
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  closeMobileMenu()

  if (index === 'users') {
    loadUsers()
  } else if (index === 'packages') {
    loadPackages()
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  return rowIndex % 2 === 1 ? 'table-row-striped' : ''
}

const handleLogout = () => {
  userStore.logout()
  router.push('/meme')
}

const loadStatistics = async () => {
  try {
    loading.statistics = true
    const response: any = await request.get('/api/v1/admin/statistics')
    Object.assign(statistics.value, response)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.statistics = false
  }
}

const loadUsers = async () => {
  try {
    loading.users = true
    const response = await request.get('/api/v1/admin/users', {
      params: {
        page: userPagination.page,
        page_size: userPagination.pageSize
      }
    })
    users.value = (response as any).users || []
    userPagination.total = (response as any).total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.users = false
  }
}

const loadPackages = async () => {
  try {
    loading.packages = true
    const response = await request.get('/api/v1/packages/', {
      params: { include_inactive: true }
    })
    packages.value = (response as any).packages || []
  } catch (error) {
    console.error('加载套餐列表失败:', error)
    ElMessage.error('加载套餐列表失败')
  } finally {
    loading.packages = false
  }
}

const refreshUsers = () => {
  loadUsers()
}

const refreshPackages = () => {
  loadPackages()
}

const handleUserPageChange = () => {
  loadUsers()
}

const handleUserPageSizeChange = () => {
  userPagination.page = 1
  loadUsers()
}

const toggleUserStatus = async (_user: any) => {
  // TODO: 实现用户状态切换
  ElMessage.info('用户状态切换功能开发中')
}

const viewUserDetail = (_user: any) => {
  // TODO: 实现查看用户详情
  ElMessage.info('用户详情功能开发中')
}

const showCreatePackageDialog = () => {
  packageDialog.isEdit = false
  packageDialog.visible = true
  resetPackageForm()
}

const editPackage = (pkg: any) => {
  packageDialog.isEdit = true
  packageDialog.visible = true
  Object.assign(packageForm, pkg)
}

const resetPackageForm = () => {
  Object.assign(packageForm, {
    package_code: '',
    package_name: '',
    description: '',
    endpoint: '',
    price: 0,
    credits: 0,
    duration_days: 30,
    sort_order: 0
  })
}

const savePackage = async () => {
  if (!packageFormRef.value) return

  try {
    await packageFormRef.value.validate()
    loading.packageSave = true

    if (packageDialog.isEdit) {
      // TODO: 更新套餐
      ElMessage.info('套餐更新功能开发中')
    } else {
      await request.post('/api/v1/packages/', packageForm)
      ElMessage.success('套餐创建成功')
      packageDialog.visible = false
      loadPackages()
    }
  } catch (error) {
    console.error('保存套餐失败:', error)
    ElMessage.error('保存套餐失败')
  } finally {
    loading.packageSave = false
  }
}

const togglePackageStatus = async (pkg: any) => {
  try {
    await request.put(`/api/v1/packages/${pkg.id}/toggle`)
    ElMessage.success('套餐状态已更新')
    loadPackages()
  } catch (error) {
    console.error('切换套餐状态失败:', error)
    ElMessage.error('操作失败')
  }
}

const deletePackage = async (pkg: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个套餐吗？', '确认删除', {
      type: 'warning'
    })

    await request.delete(`/api/v1/packages/${pkg.id}`)
    ElMessage.success('套餐已删除')
    loadPackages()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除套餐失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const viewSubscriptionDetail = (pkg: any) => {
  router.push(`/admin/subscription/${pkg.id}`)
}

// 生命周期
onMounted(() => {
  loadStatistics()
  loadUsers()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  background: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left .dashboard-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-info {
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-icon.users { background: #3498db; }
.stat-icon.active { background: #27ae60; }
.stat-icon.packages { background: #f39c12; }
.stat-icon.keys { background: #e74c3c; }

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.main-content {
  display: flex;
  padding: 0 20px 20px;
  gap: 20px;
}

.admin-sidebar {
  width: 250px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.admin-menu {
  border: none;
}

.admin-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-content {
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.content-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;
}

.placeholder-content i {
  margin-bottom: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 15px;
    height: 50px;
  }

  .dashboard-title .title-text {
    font-size: 1.2rem;
  }

  .header-right {
    gap: 8px;
  }

  .admin-info .admin-email {
    display: none;
  }

  .logout-btn .logout-text {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 15px;
  }

  .stat-card {
    padding: 15px;
    gap: 12px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .stat-content h3 {
    font-size: 1.5rem;
  }

  .mobile-menu-toggle {
    display: flex;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    z-index: 1000;
    cursor: pointer;
  }

  .main-content {
    flex-direction: column;
    padding: 0 15px 15px;
    gap: 15px;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    z-index: 1001;
    transition: left 0.3s ease;
    border-radius: 0;
  }

  .admin-sidebar.mobile-open {
    left: 0;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }

  .sidebar-header h3 {
    margin: 0;
    color: #2c3e50;
  }

  .close-menu {
    cursor: pointer;
    color: #666;
    font-size: 18px;
  }

  .mobile-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .mobile-overlay.active {
    display: block;
  }

  .admin-content {
    margin-left: 0;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    padding: 4px 8px !important;
    font-size: 12px;
  }

  .action-btn .btn-text {
    display: none;
  }

  .date-text {
    font-size: 12px;
  }

  .price-text, .duration-text {
    font-size: 12px;
  }

  .package-name-btn {
    font-size: 12px !important;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-content h3 {
    font-size: 1.3rem;
  }

  .content-section {
    padding: 15px;
  }

  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pagination-wrapper {
    overflow-x: auto;
  }

  .el-pagination {
    font-size: 12px;
  }
}

/* 表格响应式样式 */
.table-responsive {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
}

.responsive-table {
  min-width: 800px;
}

.table-row-striped {
  background-color: #f8f9fa;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 10px !important;
  font-size: 12px;
}

/* 移动端菜单默认隐藏 */
.mobile-menu-toggle {
  display: none;
}

.sidebar-header {
  display: none;
}
</style>