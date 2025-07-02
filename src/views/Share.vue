<template>
    <div class="share-page">
        <!-- 顶部导航栏 -->
        <van-nav-bar class="nav-bar" safe-area-inset-top fixed>
            <template #left>
                <van-icon name="arrow-left" size="20" class="back-icon" @click="router.back()" />
            </template>

            <template #title>
                <div class="page-title">互填问卷</div>
            </template>

            <template #right>
                <van-icon name="search" size="20" class="search-icon" @click="showSearch = true" />
            </template>
        </van-nav-bar>

        <!-- 搜索框 -->
        <van-search v-model="searchValue" shape="round" placeholder="搜索问卷" v-if="showSearch" class="search-box"
            autofocus @blur="closeSearch" />

        <!-- 筛选标签 -->
        <div class="filter-tabs">
            <van-tabs v-model:active="activeFilter" swipeable shrink title-active-color="#1989fa">
                <van-tab title="全部问卷"></van-tab>
                <van-tab title="未互填"></van-tab>
                <van-tab title="互填中"></van-tab>
                <van-tab title="已完成"></van-tab>
            </van-tabs>
        </div>

        <!-- 问卷列表 -->
        <div class="share-list">
            <div v-for="survey in filteredSurveys" :key="survey.id" class="share-card">
                <!-- 问卷基本信息 -->
                <div class="card-header">
                    <div class="survey-title">{{ survey.title }}</div>
                    <div :class="statusClass(survey.status)">{{ survey.statusText }}</div>
                </div>

                <div class="survey-content">
                    <div class="survey-info">
                        <div class="create-time">
                            <van-icon name="underway" />
                            <span>{{ formatDate(survey.createdAt) }}</span>
                        </div>
                        <div class="participants">
                            <van-icon name="friends" />
                            <span>已参与: {{ survey.collectedResponses }}/{{ survey.expectedResponses }}</span>
                        </div>
                    </div>

                    <!-- 互助信息 -->
                    <div class="share-info">
                        <div class="mutual-count">
                            <van-icon name="exchange" color="#1989fa" />
                            <span class="count">{{ survey.mutualCount }}</span>
                            <span>次互助</span>
                        </div>

                        <div class="exchange-button">
                            <van-button v-if="survey.status === 'exchange_available'" type="primary" size="small"
                                @click="exchangeSurvey(survey.id)" round>
                                立即互填
                            </van-button>

                            <van-button v-if="survey.status === 'exchange_completed'" plain size="small"
                                @click="viewExchange(survey.id)" round>
                                查看互助
                            </van-button>
                        </div>
                    </div>
                </div>

                <!-- 问卷操作区 -->
                <div class="card-actions">
                    <van-button plain size="small" @click="previewSurvey(survey.id)" class="action-btn">
                        预览问卷
                    </van-button>

                    <van-button plain size="small" @click="editSurvey(survey.id)" class="action-btn">
                        编辑问卷
                    </van-button>

                    <van-button plain size="small" @click="removeSurvey(survey.id)" class="action-btn">
                        <van-icon name="delete" />删除
                    </van-button>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredSurveys.length === 0" class="empty-state">
                <van-icon name="description" class="empty-icon" />
                <div class="empty-text">暂无问卷可互填</div>
                <div class="empty-tip">创建问卷并发布到互填区即可寻找互助</div>
                <van-button type="primary" round class="create-btn" @click="createSurvey">
                    <van-icon name="plus" />创建新问卷
                </van-button>
            </div>
        </div>

        <!-- 底部按钮 -->
        <div class="footer-action">
            <van-button type="primary" block class="publish-btn" @click="createSurvey">
                <van-icon name="plus" />发布问卷到互填区
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const showSearch = ref(false)
const searchValue = ref('')
const activeFilter = ref(0) // 筛选标签的当前值

// 格式化日期
const formatDate = (date) => {
    return dayjs(date).format('YYYY/MM/DD HH:mm')
}

// 假数据 - 模拟问卷数据
const surveys = ref([
    {
        id: 's1',
        title: '大学生消费习惯调研',
        createdAt: '2023-10-15T14:30:00',
        status: 'exchange_available',
        statusText: '未互填',
        collectedResponses: 42,
        expectedResponses: 100,
        mutualCount: 0,
        tags: ['消费', '学生']
    },
    {
        id: 's2',
        title: '城市通勤时间满意度调查',
        createdAt: '2023-10-18T09:15:00',
        status: 'exchange_in_progress',
        statusText: '互填中',
        collectedResponses: 15,
        expectedResponses: 50,
        mutualCount: 4,
        tags: ['交通', '城市']
    },
    {
        id: 's3',
        title: '短视频APP使用习惯研究',
        createdAt: '2023-10-22T16:45:00',
        status: 'exchange_completed',
        statusText: '已完成',
        collectedResponses: 75,
        expectedResponses: 80,
        mutualCount: 8,
        tags: ['媒体', '互联网']
    },
    {
        id: 's4',
        title: '职场压力测试问卷',
        createdAt: '2023-10-25T11:20:00',
        status: 'exchange_available',
        statusText: '未互填',
        collectedResponses: 28,
        expectedResponses: 100,
        mutualCount: 2,
        tags: ['职场', '心理健康']
    }
])

// 状态样式类
const statusClass = (status) => {
    const baseClass = 'survey-status'
    switch (status) {
        case 'exchange_available': return `${baseClass} status-available`
        case 'exchange_in_progress': return `${baseClass} status-in-progress`
        case 'exchange_completed': return `${baseClass} status-completed`
        default: return baseClass
    }
}

// 过滤问卷数据
const filteredSurveys = computed(() => {
    let result = [...surveys.value]

    // 根据搜索关键词过滤
    if (searchValue.value) {
        const keyword = searchValue.value.toLowerCase()
        result = result.filter(survey =>
            survey.title.toLowerCase().includes(keyword) ||
            (survey.tags && survey.tags.some(tag => tag.toLowerCase().includes(keyword)))
        )
    }

    // 根据活动标签过滤
    switch (activeFilter.value) {
        case 1: // 未互填
            result = result.filter(survey => survey.status === 'exchange_available')
            break
        case 2: // 互填中
            result = result.filter(survey => survey.status === 'exchange_in_progress')
            break
        case 3: // 已完成
            result = result.filter(survey => survey.status === 'exchange_completed')
            break
    }

    return result
})

// 关闭搜索
const closeSearch = () => {
    if (!searchValue.value) {
        showSearch.value = false
    }
}

// 操作函数
const exchangeSurvey = (id) => {
    console.log(`互填问卷：${id}`)
    // 这里添加互填逻辑
}

const viewExchange = (id) => {
    console.log(`查看互助详情：${id}`)
    router.push({ name: 'ExchangeDetail', params: { id } })
}

const previewSurvey = (id) => {
    console.log(`预览问卷：${id}`)
    router.push({ name: 'SurveyPreview', params: { id } })
}

const editSurvey = (id) => {
    console.log(`编辑问卷：${id}`)
    router.push({ name: 'SurveyEditor', params: { id } })
}

const removeSurvey = (id) => {
    console.log(`删除问卷：${id}`)
    surveys.value = surveys.value.filter(survey => survey.id !== id)
}

const createSurvey = () => {
    router.push({ name: 'CreateQuestionnaire' })
}

onMounted(() => {
    // 模拟加载效果
    setTimeout(() => {
        // 这里可以添加从API加载数据的逻辑
    }, 500)
})
</script>

<style scoped>
.share-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    overflow: auto;
    padding-bottom: 70px;
}

.nav-bar {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.search-box {
    background-color: #fff;
    padding: 8px 16px;
    position: fixed;
    top: 46px;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-tabs {
    margin-top: 46px;
    background-color: #fff;
    position: sticky;
    top: 46px;
    z-index: 90;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.share-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: calc(100vh - 180px);
}

.share-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 16px;
    transition: all 0.3s;
}

.share-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.survey-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.survey-status {
    font-size: 13px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;
    margin-left: 10px;
    flex-shrink: 0;
}

.status-available {
    background-color: #e6f7ff;
    color: #1890ff;
}

.status-in-progress {
    background-color: #fff7e6;
    color: #fa8c16;
}

.status-completed {
    background-color: #f6ffed;
    color: #52c41a;
}

.survey-content {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;
}

.survey-info {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
}

.create-time,
.participants {
    display: flex;
    align-items: center;
}

.van-icon {
    margin-right: 5px;
    font-size: 16px;
}

.share-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 8px;
    background-color: #f8fbff;
    border-radius: 12px;
    margin-top: 10px;
}

.mutual-count {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #333;
}

.mutual-count .count {
    color: #1989fa;
    font-weight: 700;
    margin: 0 4px;
}

.exchange-button .van-button {
    height: 32px;
    padding: 0 16px;
    font-weight: 500;
}

.card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.action-btn {
    border-radius: 16px;
    font-size: 13px;
    height: 32px;
    padding: 0 14px;
    display: flex;
    align-items: center;
}

.empty-state {
    margin-top: 30px;
    text-align: center;
    padding: 30px 0;
}

.empty-icon {
    font-size: 80px;
    color: #e0e4e9;
    margin-bottom: 15px;
}

.empty-text {
    font-size: 18px;
    color: #333;
    font-weight: 500;
    margin-bottom: 10px;
}

.empty-tip {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
}

.create-btn {
    height: 44px;
    padding: 0 28px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
}

.create-btn .van-icon {
    font-size: 18px;
    margin-right: 6px;
}

.footer-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.publish-btn {
    height: 48px;
    border-radius: 24px;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.publish-btn .van-icon {
    font-size: 20px;
    margin-right: 6px;
}
</style>