function getManageTab() {
  try {
    var t = (window.__MN_MANAGE_TAB__ || '').toString()
    if (t === 'school' || t === 'classes' || t === 'cameras') return t
    return 'school'
  } catch (e) {
    return 'school'
  }
}

function notify(message, variant) {
  if (window.mnToast) window.mnToast(message, variant || 'info')
  else alert(message)
}

var app = new Vue({
  el: '#app',
  data: function () {
    return {
      tab: getManageTab(),
      isLoading: true,
      loadError: false,
      schools: [],
      classes: [],
      cameras: [],
      schoolForm: {
        name: '',
        description: ''
      },
      newClassName: '',
      newCamera: {
        name: '',
        rtsp: '',
        hls: ''
      },
      editClass: null,
      editClassName: '',
      editClassCameraIds: []
    }
  },
  computed: {
    currentSchool: function () {
      return (this.schools || [])[0] || null
    }
  },
  methods: {
    refresh: function () {
      this.loadAll()
    },
    loadAll: function () {
      var that = this
      that.isLoading = true
      that.loadError = false
      graphql(
        `
        query {
          allSchools { id name description }
          allLopHocs { id name cameras { id name } }
          allCameras { id name rtsp hls state }
        }
      `
      )
        .then(function (result) {
          that.schools = (result && result.data && result.data.allSchools) || []
          that.classes = (result && result.data && result.data.allLopHocs) || []
          that.cameras = (result && result.data && result.data.allCameras) || []
          if (that.currentSchool) {
            that.schoolForm.name = that.currentSchool.name || ''
            that.schoolForm.description = that.currentSchool.description || ''
          } else {
            that.schoolForm.name = ''
            that.schoolForm.description = ''
          }
          that.isLoading = false
        })
        .catch(function (e) {
          console.log(e)
          that.isLoading = false
          that.loadError = true
        })
    },
    createSchool: function () {
      var that = this
      var name = (that.schoolForm.name || '').trim()
      var description = (that.schoolForm.description || '').trim()
      if (!name) return notify('Vui lòng nhập tên trường', 'warning')
      graphql(
        `
        mutation ($name: String, $description: String) {
          createSchool(data: { name: $name, description: $description }) { id }
        }
      `,
        { name: name, description: description }
      )
        .then(function (res) {
          if (res && res.data && res.data.createSchool && res.data.createSchool.id) {
            notify('Đã tạo thông tin trường', 'success')
            that.loadAll()
          } else {
            notify('Không tạo được trường', 'danger')
          }
        })
        .catch(function (e) {
          console.log(e)
          notify('Không tạo được trường', 'danger')
        })
    },
    saveSchool: function () {
      var that = this
      if (!that.currentSchool) return
      var name = (that.schoolForm.name || '').trim()
      var description = (that.schoolForm.description || '').trim()
      if (!name) return notify('Vui lòng nhập tên trường', 'warning')
      graphql(
        `
        mutation ($id: ID!, $name: String, $description: String) {
          updateSchool(id: $id, data: { name: $name, description: $description }) { id }
        }
      `,
        { id: that.currentSchool.id, name: name, description: description }
      )
        .then(function () {
          notify('Đã lưu', 'success')
          that.loadAll()
        })
        .catch(function (e) {
          console.log(e)
          notify('Không lưu được', 'danger')
        })
    },
    createClass: function () {
      var that = this
      var name = (that.newClassName || '').trim()
      if (!that.currentSchool) return notify('Cần tạo trường trước', 'warning')
      if (!name) return notify('Vui lòng nhập tên lớp', 'warning')
      graphql(
        `
        mutation ($name: String, $schoolId: ID!) {
          createLopHoc(data: { name: $name, school: { connect: { id: $schoolId } } }) { id }
        }
      `,
        { name: name, schoolId: that.currentSchool.id }
      )
        .then(function (res) {
          if (res && res.data && res.data.createLopHoc && res.data.createLopHoc.id) {
            that.newClassName = ''
            notify('Đã tạo lớp', 'success')
            that.loadAll()
          } else {
            notify('Không tạo được lớp', 'danger')
          }
        })
        .catch(function (e) {
          console.log(e)
          notify('Không tạo được lớp', 'danger')
        })
    },
    deleteClass: function (lh) {
      var that = this
      if (!lh || !lh.id) return
      if (!confirm('Xoá lớp này?')) return
      graphql(
        `
        mutation ($id: ID!) { deleteLopHoc(id: $id) { id } }
      `,
        { id: lh.id }
      )
        .then(function () {
          notify('Đã xoá lớp', 'success')
          that.loadAll()
        })
        .catch(function (e) {
          console.log(e)
          notify('Không xoá được lớp', 'danger')
        })
    },
    createCamera: function () {
      var that = this
      var name = (that.newCamera.name || '').trim()
      var rtsp = (that.newCamera.rtsp || '').trim()
      var hls = (that.newCamera.hls || '').trim()
      if (!name) return notify('Vui lòng nhập tên camera', 'warning')
      graphql(
        `
        mutation ($name: String, $rtsp: String, $hls: String) {
          createCamera(data: { name: $name, rtsp: $rtsp, hls: $hls }) { id }
        }
      `,
        { name: name, rtsp: rtsp, hls: hls }
      )
        .then(function (res) {
          if (res && res.data && res.data.createCamera && res.data.createCamera.id) {
            that.newCamera = { name: '', rtsp: '', hls: '' }
            notify('Đã tạo camera', 'success')
            that.loadAll()
          } else {
            notify('Không tạo được camera', 'danger')
          }
        })
        .catch(function (e) {
          console.log(e)
          notify('Không tạo được camera', 'danger')
        })
    },
    deleteCamera: function (cm) {
      var that = this
      if (!cm || !cm.id) return
      if (!confirm('Xoá camera này?')) return
      graphql(
        `
        mutation ($id: ID!) { deleteCamera(id: $id) { id } }
      `,
        { id: cm.id }
      )
        .then(function () {
          notify('Đã xoá camera', 'success')
          that.loadAll()
        })
        .catch(function (e) {
          console.log(e)
          notify('Không xoá được camera', 'danger')
        })
    },
    openEditClass: function (lh) {
      if (!lh || !lh.id) return
      this.editClass = lh
      this.editClassName = lh.name || ''
      this.editClassCameraIds = (lh.cameras || []).map(function (cm) {
        return cm.id
      })
      if (window.$ && $('#editClassModal').length) {
        $('#editClassModal').modal('show')
      }
    },
    isEditClassCameraSelected: function (cameraId) {
      return this.editClassCameraIds.indexOf(cameraId) >= 0
    },
    toggleEditClassCamera: function (cm) {
      if (!cm || !cm.id) return
      var idx = this.editClassCameraIds.indexOf(cm.id)
      if (idx >= 0) this.editClassCameraIds.splice(idx, 1)
      else this.editClassCameraIds.push(cm.id)
    },
    saveEditClass: function () {
      var that = this
      if (!that.editClass || !that.editClass.id) return
      var name = (that.editClassName || '').trim()
      if (!name) return notify('Vui lòng nhập tên lớp', 'warning')

      var currentIds = (that.editClass.cameras || []).map(function (cm) {
        return cm.id
      })
      var nextIds = (that.editClassCameraIds || []).slice()
      var connect = nextIds
        .filter(function (id) {
          return currentIds.indexOf(id) < 0
        })
        .map(function (id) {
          return { id: id }
        })
      var disconnect = currentIds
        .filter(function (id) {
          return nextIds.indexOf(id) < 0
        })
        .map(function (id) {
          return { id: id }
        })

      graphql(
        `
        mutation ($id: ID!, $name: String, $connect: [CameraWhereUniqueInput!], $disconnect: [CameraWhereUniqueInput!]) {
          updateLopHoc(id: $id, data: { name: $name, cameras: { connect: $connect, disconnect: $disconnect } }) { id }
        }
      `,
        { id: that.editClass.id, name: name, connect: connect, disconnect: disconnect }
      )
        .then(function () {
          if (window.$ && $('#editClassModal').length) {
            $('#editClassModal').modal('hide')
          }
          that.editClass = null
          that.editClassName = ''
          that.editClassCameraIds = []
          notify('Đã cập nhật lớp', 'success')
          that.loadAll()
        })
        .catch(function (e) {
          console.log(e)
          notify('Không cập nhật được', 'danger')
        })
    }
  },
  mounted: function () {
    this.loadAll()
  }
})

