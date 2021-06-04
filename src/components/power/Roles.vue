<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="addRoleDialogVisible=true">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList"
                border
                stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
                    v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="[i2===0?'':'bdtop','vcenter']"
                        v-for="(item2,i2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="(item3) in item2.children"
                            :key="item3.id"
                            closable
                            @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"> </el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"> </el-table-column>
        <el-table-column label="操作"
                         width="300px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="shoSetRightDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="deleteRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning"
                       icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限对话框"
               :visible.sync="setRightDialog"
               width="50%">
      <el-tree :data="rightsList"
               :props="treeProps"
               default-expand-all
               show-checkbox
               node-key="id"
               :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary"
                   @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色"
               :visible.sync="addRoleDialogVisible"
               width="50%"
               @close="addRoleDialogClosed">
      <el-form ref="addRoleFormRef"
               :model="addRoleForm"
               :rules="addRoleFormRules"
               label-width="100px">
        <el-form-item label="角色名称"
                      prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述"
                      prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色"
               :visible.sync="editRoleDialogVisible"
               width="50%"
               @close="editRoleDialogClosed">
      <el-form ref="editRoleFormRef"
               :model="editRoleForm"
               :rules="addRoleFormRules"
               label-width="100px">
        <el-form-item label="角色名称"
                      prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述"
                      prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data () {
    return {
      // 分配角色可视化flag
      addRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {},
      // 添加角色表单数据验证
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
          , { min: 2, max: 10, message: '角色名称的长度需在2-10位' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }

        ]
      },
      // 编辑角色对话框flag
      editRoleDialogVisible: false,
      // 编辑角色对话框表单数据
      editRoleForm: {},
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限的对话框的隐藏与显示
      setRightDialog: false,
      rightsList: [],
      // 树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      defKeys: [],
      // 分配角色的id
      roleId: '',

    }
  },
  created () {
    this.getRolesList();
  },
  methods: {
    addRole () {
      // 进行添加角色的表单验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单验证失败！')
        }
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加角色成功！')
        this.addRoleDialogVisible = false
        this.getRolesList();
      })
    },
    // 重置添加角色的表单
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 重置编辑表单
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields();
    },
    // 编辑按钮弹出函数
    async shoSetRightDialog (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
      this.editRoleForm = res.data;
      this.editRoleDialogVisible = true;
    },
    // 编辑角色请求按钮
    async editRole () {

      const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, this.editRoleForm);
      if (res.meta.status !== 200) return this.$message.error('编辑角色失败！')
      this.$message.success('编辑角色成功！')
      this.editRoleDialogVisible = false;
      this.getRolesList();
    },
    // 删除表单角色
    async deleteRoleById (id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm('此操作将永久角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== "confirm") return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) {
        this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList();
    },
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data;
    },
    // 弹框提示是否删除
    async removeRightById (role, rightId) {
      const confirmResutl = await this.$confirm('是否确认删除该权限？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResutl !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      role.children = res.data;
    },
    async showSetRightDialog (role) {
      this.roleId = role.id;
      this.defKeys = []
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败！')
      this.rightsList = res.data;
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialog = true;
    },
    // 递归获取所有id
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    async allotRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(),
      ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',');
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('更新权限成功！')
      this.getRolesList();
      this.setRightDialog = false

    }

  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
