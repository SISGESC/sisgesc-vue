<template lang="pug">
v-container
  v-row
    v-col.d-flex.justify-space-between.align-center(cols="12")
      h1.text-h4.mb-4 Turmas
      v-btn(color="primary" @click="openCreateDialog")
        v-icon(left) mdi-plus
        | Nova Turma

  v-card
    v-card-text
      v-data-table(
        :headers="headers"
        :items="classes"
        sort-by="name"
        :items-per-page="10"
        :search="search"
        :loading="loading"
      )
        template(v-slot:top)
          v-text-field.mb-4(
            v-model="search"
            label="Buscar"
            single-line
            hide-details
            prepend-icon="mdi-magnify"
          )

        template(v-slot:item.status="{ item }")
          v-chip(
            :color="item.status === 'inactive' ? 'error' : 'success'"
            small
          ) {{ item.status === 'inactive' ? 'Inativa' : 'Ativa' }}

        template(v-slot:item.actions="{ item }")
          v-btn(
            color="primary"
            icon
            small
            @click="editClass(item)"
          )
            v-icon mdi-pencil

          v-btn(
            color="error"
            icon
            small
            @click="confirmDelete(item)"
          )
            v-icon mdi-delete

        template(v-slot:no-data)
          .text-center.py-4
            | Nenhuma turma encontrada

  v-dialog(v-model="dialog" max-width="600px")
    v-card
      v-card-title
        span.text-h5 {{ formTitle }}
      v-card-text
        v-container
          v-row
            v-col(cols="12")
              v-text-field(
                v-model="editedItem.name"
                label="Nome da Turma"
                required
                :rules="[(v) => !!v || 'Nome é obrigatório']"
              )
            v-col(cols="12" sm="6")
              v-text-field(
                v-model="editedItem.capacity"
                type="number"
                label="Capacidade"
                required
                :rules="[(v) => !!v || 'Capacidade é obrigatória']"
              )
            v-col(cols="12" sm="6")
              v-select(
                v-model="editedItem.grade"
                label="Série"
                :items="grades"
                required
                :rules="[(v) => !!v || 'Série é obrigatória']"
              )
            v-col(cols="12")
              v-select(
                v-model="editedItem.teacherId"
                label="Professor Responsável"
                :items="teachers"
                item-text="name"
                item-value="id"
                required
                :rules="[(v) => !!v || 'Professor é obrigatório']"
              )
            v-col(cols="12")
              v-select(
                v-model="editedItem.schedule"
                label="Horário"
                :items="schedules"
                required
                :rules="[(v) => !!v || 'Horário é obrigatório']"
              )
            v-col(cols="12")
              v-switch(
                v-model="editedItem.status"
                label="Turma Ativa"
                :true-value="'active'"
                :false-value="'inactive'"
              )

      v-card-actions
        v-spacer
        v-btn(
          color="grey darken-1"
          text
          @click="closeDialog"
        ) Cancelar
        v-btn(color="primary" @click="saveClass") Salvar

  v-dialog(v-model="deleteDialog" max-width="400px")
    v-card
      v-card-title
        span.text-h5 Confirmar Exclusão
      v-card-text
        | Tem certeza que deseja excluir a turma "{{ editedItem.name }}"?
      v-card-actions
        v-spacer
        v-btn(
          color="grey darken-1"
          text
          @click="deleteDialog = false"
        ) Cancelar
        v-btn(color="error" @click="deleteClass") Excluir
</template>

<script>
import { sisgescAPI } from '@/api/index'

export default {
  name: 'ClassesPage',
  data() {
    return {
      search: '',
      dialog: false,
      deleteDialog: false,
      loading: false,
      headers: [
        { text: 'Nome', value: 'name' },
        { text: 'Série', value: 'grade' },
        { text: 'Capacidade', value: 'capacity' },
        { text: 'Professor', value: 'teacherName' },
        { text: 'Horário', value: 'schedule' },
        { text: 'Status', value: 'status' },
        { text: 'Ações', value: 'actions', sortable: false }
      ],
      classes: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        grade: '',
        capacity: 0,
        teacherId: null,
        teacherName: '',
        schedule: '',
        status: 'active'
      },
      defaultItem: {
        name: '',
        grade: '',
        capacity: 0,
        teacherId: null,
        teacherName: '',
        schedule: '',
        status: 'active'
      },
      grades: [
        'Berçário',
        'Maternal',
        'Pré I',
        'Pré II',
        '1º Ano',
        '2º Ano',
        '3º Ano',
        '4º Ano',
        '5º Ano'
      ],
      teachers: [],
      schedules: [
        'Manhã (7h às 12h)',
        'Tarde (13h às 18h)',
        'Integral (7h às 18h)'
      ]
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nova Turma' : 'Editar Turma'
    }
  },
  async created() {
    await this.loadClasses()
    await this.loadTeachers()
  },
  methods: {
    async loadClasses() {
      this.loading = true
      try {
        const token = this.$store.getters['user/token']
        // eslint-disable-next-line no-console
        console.log({ token })

        const { data } = await sisgescAPI.get('/classes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        // eslint-disable-next-line no-console
        console.log({ data })

        this.classes = data.map((classGroup) => ({
          id: classGroup.uuid,
          name: classGroup.name,
          grade: classGroup.grade,
          capacity: classGroup.capacity,
          teacherId: classGroup.teacherId,
          teacherName: classGroup.teacherName || 'Não atribuído',
          schedule: classGroup.schedule,
          status: classGroup.status ? 'active' : 'inactive'
        }))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading classes:', error)
      } finally {
        this.loading = false
      }
    },
    async loadTeachers() {
      try {
        // const token = this.$store.getters['user/token']

        // const { data } = await sisgescAPI.get('/teachers', {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // })

        // this.teachers = data.map((teacher) => ({
        //   id: teacher.uuid,
        //   name: teacher.name
        // }))
        this.teachers = [{ id: 1, name: 'Vinicus Garcia' }]
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading teachers:', error)
      }
    },
    editClass(item) {
      this.editedIndex = this.classes.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    openCreateDialog() {
      this.editedIndex = -1
      this.editedItem = Object.assign({}, this.defaultItem)
      this.dialog = true
    },
    confirmDelete(item) {
      this.editedIndex = this.classes.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.deleteDialog = true
    },
    async deleteClass() {
      try {
        const token = this.$store.getters['user/token']

        await sisgescAPI.delete(`/class-groups/${this.editedItem.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.classes.splice(this.editedIndex, 1)
        this.deleteDialog = false
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting class:', error)
      }
    },
    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    async saveClass() {
      try {
        const token = this.$store.getters['user/token']
        const teacher = this.teachers.find(
          (t) => t.id === this.editedItem.teacherId
        )

        const classData = {
          name: this.editedItem.name,
          grade: this.editedItem.grade,
          capacity: parseInt(this.editedItem.capacity),
          teacherId: this.editedItem.teacherId,
          schedule: this.editedItem.schedule,
          status: this.editedItem.status === 'active'
        }

        if (this.editedIndex > -1) {
          // Update existing class
          await sisgescAPI.put(
            `/class-groups/${this.editedItem.id}`,
            classData,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          Object.assign(this.classes[this.editedIndex], {
            ...this.editedItem,
            teacherName: teacher ? teacher.name : 'Não atribuído'
          })
        } else {
          // Create new class
          const { data } = await sisgescAPI.post('/class-groups', classData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          this.classes.push({
            id: data.uuid,
            name: data.name,
            grade: data.grade,
            capacity: data.capacity,
            teacherId: data.teacherId,
            teacherName: teacher ? teacher.name : 'Não atribuído',
            schedule: data.schedule,
            status: data.status ? 'active' : 'inactive'
          })
        }

        this.closeDialog()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving class:', error)
      }
    }
  }
}
</script>

<style scoped>
.v-data-table {
  width: 100%;
}
</style>
