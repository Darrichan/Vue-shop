<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="id"
                  border
                  :show-row-hover="false"
                  class="treeTable">
        <!-- 是否有效的模板 -->
        <template slot="isok"
                  slot-scope="scope">
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted===false"
             style="color:lightgreen;"></i>
          <i class="el-icon-error"
             v-else
             style="color:red"></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order"
                  slot-scope="scope">
          <el-tag size="mini"
                  v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success"
                  size="mini"
                  v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning"
                  size="mini"
                  v-else>三级</el-tag>

        </template>

        <!-- 操作 -->
        <template slot="opt"
                  slot-scope="scope"
                  style="width:1.8rem">
          <el-button type="primary"
                     icon="el-icon-edit"
                     size="mini"
                     @click="editCateDialogCallBack(scope.row)">编辑</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     size="mini"
                     @click="deleteCate(scope.row)">删除</el-button>
        </template>

      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5,10,15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类弹出对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%"
               @close="addCateDialogClosed">
      <!-- 添加对话框表单内容主题区域 -->
      <el-form label-width="80px"
               ref="addCateFormRef"
               :model="addCateForm"
               :rules="addCateFormRules">
        <el-form-item label="分类名称"
                      prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <div class="block">
            <span class="demonstration"></span>
            <el-cascader :options="parentCateList"
                         :props="{expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children'}"
                         v-model="selectedKeys"
                         @change="parentCateChanged"
                         clearable
                         change-on-select></el-cascader>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类弹出框-->
    <el-dialog title="编辑分类"
               :visible.sync="editCateDialogVisible"
               width="50%"
               @close="editCateDialogClosed">
      <!-- 添加对话框表单内容主题区域 -->
      <el-form label-width="80px"
               ref="editCateFormRef"
               :model="editCateForm"
               :rules="editCateFormRules">
        <el-form-item label="分类名称"
                      prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editCate()">确 定</el-button>
      </span>

    </el-dialog>
  </div>
</template>
<script>
export default {
  created () {
    this.getCateList();
  },
  data () {
    return {
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagesize: 5,
        pagenum: 1
      },
      // 总数据条数
      total: 0,
      // 为table指定列对象
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        type: 'template',
        // 当前模板使用的名称
        template: 'isok'
      },
      {
        label: '排序',
        type: 'template',
        // 当前模板使用的名称
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        // 当前模板使用的名称
        width: '180px',
        template: 'opt'
      }],
      // 添加分类对话框是否可见flag
      addCateDialogVisible: false,
      // 添加变淡分类内容
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cate_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
      },
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器的选中数组
      selectedKeys: [],
      // 编辑分类对话框flag
      editCateDialogVisible: false,
      // 编辑分类页面自定义规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 编辑分类表单数据
      editCateForm: {}
    }

  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.cateList = res.data.result;
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList()
    },
    // 监听pagemun的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 添加分类弹出框关闭后重置
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields();
      // 表单重置了
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 添加分类按钮
    showAddCateDialog () {
      // 获取父级分类列表数据
      this.getParentCateList();
      this.addCateDialogVisible = true;

    },
    // 获取父级级联选择
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
      this.parentCateList = res.data
    },
    parentCateChanged () {
      // 条件selectedKeys的length需要大于0，否则为没选择父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length;
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }

    },
    // 添加分类确定按钮
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 删除分类按钮
    deleteCate (row) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${row.cat_id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        if ((this.total - 1) % this.queryInfo.pagesize == 0) {
          this.queryInfo.pagenum -= 1
        }
        this.getCateList();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });


    },

    // 编辑分类框关闭回调
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields();
    },
    // 编辑按钮函数
    async editCateDialogCallBack (row) {
      const { data: res } = await this.$http.get(`categories/${row.cat_id}`)
      if (res.meta.status !== 200) { return this.$message.error('获取分类列表失败') }
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    // 编辑对话框确认按钮的回调函数
    async editCate () {
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name});
      if(res.meta.status!==200)return this.$message.error('更新类别失败！')
      this.$message.success('更新类别成功！')
      this.getCateList();
      this.editCateDialogVisible = false;
    },
  }

}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
