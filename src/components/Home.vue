<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png"
             alt=""
             class="headerLogo">电商后台管理系统
      </div>
      <el-button type="info"
                 @click="logout">退出
      </el-button>
    </el-header>
    <!-- 侧边栏 -->
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button"
             @click="toggleCollapase">|||</div>
        <el-menu background-color="#333744"
                 text-color="#fff"
                 active-text-color="#00a1d6"
                 :unique-opened="true"
                 :collapse="isCollapse"
                 :collapse-transition="false"
                 :router='true'
                 :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="'/'+item.path"
                      v-for="item in menuList"
                      :key="item.id">
            <template slot="title"
                      style="width=200px;">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path"
                          v-for="subItem in item.children"
                          :key="subItem.id"
                          @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>

</template>

<script>
export default {
  created () {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        '125': 'el-icon-user-solid',
        '103': 'el-icon-copy-document',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-tickets',
        '145': 'el-icon-document-copy',
      },
      isCollapse: false,
      activePath:''
    }
  },
  methods: {
    toggleCollapase () {
      this.isCollapse = !this.isCollapse;
    },
    logout () {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login');
      this.$message.success('退出成功！')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data;
    },
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath;
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    height: 100%;
    align-items: center;
    margin-left: 15px;
    .headerLogo {
      display: flex;
      height: 100%;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.el-footer {
  background-color: #fff;
}
.home-container {
  height: 100%;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 15px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2rem;
  cursor: pointer;
}
</style>
