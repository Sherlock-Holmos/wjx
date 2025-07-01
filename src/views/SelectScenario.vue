<template>
  <div class="scenario-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar safe-area-inset-top fixed>
      <template #title>
        <div class="nav-title">选择应用场景</div>
      </template>
      <template #right>
        <van-icon name="close" size="20" @click="closePage" />
      </template>
    </van-nav-bar>

    <!-- 场景选择区域 -->
    <div class="scenario-container">
      <div class="scenario-grid">
        <div 
          v-for="scenario in scenarios" 
          :key="scenario.id" 
          class="scenario-card"
          @click="selectScenario(scenario)"
        >
          <div class="scenario-header">
            <van-icon :name="scenario.icon" size="24" class="icon" />
            <div class="title">{{ scenario.title }}</div>
          </div>
          <div class="description">{{ scenario.description }}</div>
          <div v-if="scenario.features" class="features">
            <div 
              v-for="(feature, idx) in scenario.features" 
              :key="idx"
              class="feature"
            >
              {{ feature }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const scenarios = ref([
  {
    id: 1,
    title: "调查",
    icon: "todo-list",
    description: "题型多·逻辑强 功能多",
  },
  {
    id: 2,
    title: "考试",
    icon: "edit",
    description: "可抽题·防作弊 自动阅卷",
  },
  {
    id: 3,
    title: "投票",
    icon: "like",
    description: "图文视频·排行榜 投票墙",
  },
  {
    id: 4,
    title: "表单流程",
    icon: "form",
    description: "信息登记·活动报名签到",
  },
  {
    id: 5,
    title: "360度评估",
    icon: "chart",
    description: "维度权重 部门/个人报告",
  },
  {
    id: 6,
    title: "接龙",
    icon: "orders",
    description: "预设名单 进度跟踪",
  },
  {
    id: 7,
    title: "收款",
    icon: "cash-back-record",
    description: "网络交易，微信收款，方便快捷",
  },
  {
    id: 8,
    title: "客户体验管理",
    icon: "comment-circle",
    description: "NPS问卷调查",
    features: ["客户满意度调查", "客户反馈差评预警", "客户满意率 客户抱怨率"]
  },
  {
    id: 9,
    title: "员工体验管理",
    icon: "friends",
    description: "满意度调查",
    features: ["SWOT分析 满意度", "员工敬业度调查", "敬业度 影响因子"]
  },
  {
    id: 10,
    title: "人才盘点",
    icon: "manager",
    description: "维度权重",
    features: ["人才盘点九宫格"]
  }
]);

const selectScenario = (scenario) => {
  console.log(`选择场景: ${scenario.title}`);
  // 这里应该触发跳转到问卷创建页面的相应流程
    router.push({ name: 'CreateQuestionnaire', params: { scenarioId: scenario.id } });
};

const closePage = () => {
  router.back();
};
</script>

<style scoped>
/* 基础页面样式 */
.scenario-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

/* 导航栏样式 */
.van-nav-bar {
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

/* 场景选择区域 */
.scenario-container {
  flex: 1;
  padding: 20px 16px;
  padding-top: 56px; /* 导航栏高度 */
  overflow-y: auto;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 10px;
}

/* 场景卡片样式 */
.scenario-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scenario-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.scenario-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.icon {
  color: #1989fa;
  margin-right: 8px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.features {
  margin-top: auto;
  padding-top: 10px;
}

.feature {
  font-size: 12px;
  color: #666;
  padding: 3px 0;
  position: relative;
  padding-left: 12px;
}

.feature::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #1989fa;
}
</style>