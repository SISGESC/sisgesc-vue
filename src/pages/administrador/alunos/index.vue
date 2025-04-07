<template lang="pug">
div
  qt-header(title="Gestão de Alunos e Responsáveis")
  v-container
    v-row
      v-col(cols="12")
        v-card
          v-card-title
            v-row(align="center")
              v-col
                span.text-h5 Responsáveis
              v-col(cols="auto")
                v-btn(color="primary" @click="openGuardianDialog()")
                  v-icon(left) mdi-plus
                  | Novo Responsável
          v-card-text
            v-data-table(
              :headers="guardianHeaders"
              :items="guardians"
              :search="guardianSearch"
              :items-per-page="10"
              :loading="loadingGuardians"
            )
              template(v-slot:top)
                v-row
                  v-col(cols="12" sm="6")
                    v-text-field.mb-4(
                      v-model="guardianSearch"
                      label="Buscar responsável"
                      single-line
                      hide-details
                      prepend-icon="mdi-magnify"
                    )

              template(v-slot:item.status="{ item }")
                v-chip(
                  :color="item.status === 'active' ? 'success' : 'error'"
                  small
                ) {{ item.status === 'active' ? 'Ativo' : 'Inativo' }}

              template(v-slot:item.actions="{ item }")
                v-btn(
                  color="primary"
                  icon
                  small
                  @click="openGuardianDialog(item)"
                )
                  v-icon mdi-pencil
                v-btn(
                  color="info"
                  icon
                  small
                  @click="viewGuardianStudents(item)"
                )
                  v-icon mdi-account-child
                v-btn(
                  color="error"
                  icon
                  small
                  @click="confirmDeleteGuardian(item)"
                )
                  v-icon mdi-delete

    v-dialog(v-model="guardianDialog" max-width="600px")
      v-card
        v-card-title
          v-row(align="center")
            v-col
              span.text-h5 {{ editedGuardian.id ? 'Editar' : 'Novo' }} Responsável
            v-col(cols="auto")
              v-btn(icon @click="guardianDialog = false")
                v-icon mdi-close

        v-card-text
          v-form(ref="guardianForm" v-model="guardianFormValid")
            v-row
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedGuardian.name"
                  label="Nome"
                  required
                )
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedGuardian.email"
                  label="E-mail"
                  required
                )
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedGuardian.phone"
                  label="Telefone"
                  required
                )
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedGuardian.cpf"
                  label="CPF"
                  required
                )
              v-col(cols="12")
                v-textarea(
                  v-model="editedGuardian.address"
                  label="Endereço"
                  required
                )
              v-col(cols="12")
                v-switch(
                  v-model="editedGuardian.status"
                  label="Ativo"
                  color="success"
                  :true-value="'active'"
                  :false-value="'inactive'"
                )

        v-card-actions
          v-spacer
          v-btn(text @click="guardianDialog = false") Cancelar
          v-btn(
            color="primary"
            :loading="savingGuardian"
            :disabled="!guardianFormValid"
            @click="saveGuardian"
          ) Salvar

    v-dialog(v-model="deleteGuardianDialog" max-width="400px")
      v-card
        v-card-title
          v-row(align="center")
            v-col
              span.text-h5 Confirmar Exclusão
            v-col(cols="auto")
              v-btn(icon @click="deleteGuardianDialog = false")
                v-icon mdi-close

        v-card-text
          | Tem certeza que deseja excluir o responsável {{ guardianToDelete?.name }}?
          | Esta ação não pode ser desfeita.

        v-card-actions
          v-spacer
          v-btn(text @click="deleteGuardianDialog = false") Cancelar
          v-btn(
            color="error"
            :loading="deletingGuardian"
            @click="deleteGuardian"
          ) Excluir

    v-dialog(v-model="studentsDialog" max-width="900px")
      v-card
        v-card-title
          v-row(align="center")
            v-col
              span.text-h5 Alunos de {{ selectedGuardian?.name }}
            v-col(cols="auto")
              v-btn(color="primary" @click="openStudentDialog()")
                v-icon(left) mdi-plus
                | Novo Aluno
            v-col(cols="auto")
              v-btn(icon @click="studentsDialog = false")
                v-icon mdi-close

        v-card-text
          v-data-table(
            :headers="studentHeaders"
            :items="students"
            :search="studentSearch"
            :items-per-page="10"
            :loading="loadingStudents"
          )
            template(v-slot:top)
              v-row
                v-col(cols="12" sm="6")
                  v-text-field.mb-4(
                    v-model="studentSearch"
                    label="Buscar aluno"
                    single-line
                    hide-details
                    prepend-icon="mdi-magnify"
                  )

            template(v-slot:item.status="{ item }")
              v-chip(
                :color="item.status === 'active' ? 'success' : 'error'"
                small
              ) {{ item.status === 'active' ? 'Ativo' : 'Inativo' }}

            template(v-slot:item.actions="{ item }")
              v-btn(
                color="primary"
                icon
                small
                @click="openStudentDialog(item)"
              )
                v-icon mdi-pencil
              v-btn(
                color="error"
                icon
                small
                @click="confirmDeleteStudent(item)"
              )
                v-icon mdi-delete

            template(v-slot:no-data)
              .text-center.py-4
                | Nenhum aluno encontrado

    v-dialog(v-model="studentDialog" max-width="600px")
      v-card
        v-card-title
          v-row(align="center")
            v-col
              span.text-h5 {{ editedStudent.id ? 'Editar' : 'Novo' }} Aluno
            v-col(cols="auto")
              v-btn(icon @click="studentDialog = false")
                v-icon mdi-close

        v-card-text
          v-form(ref="studentForm" v-model="studentFormValid")
            v-row
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedStudent.name"
                  label="Nome"
                  required
                )
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedStudent.birthDate"
                  type="date"
                  label="Data de Nascimento"
                  required
                )
              v-col(cols="12" sm="6")
                v-select(
                  v-model="editedStudent.gender"
                  label="Gênero"
                  :items="genderOptions"
                  required
                )
              v-col(cols="12" sm="6")
                v-text-field(
                  v-model="editedStudent.registration"
                  label="Matrícula"
                  required
                )
              v-col(cols="12")
                v-textarea(
                  v-model="editedStudent.notes"
                  label="Observações"
                  rows="3"
                )
              v-col(cols="12")
                v-switch(
                  v-model="editedStudent.status"
                  label="Ativo"
                  color="success"
                  :true-value="'active'"
                  :false-value="'inactive'"
                )

        v-card-actions
          v-spacer
          v-btn(text @click="studentDialog = false") Cancelar
          v-btn(
            color="primary"
            :loading="savingStudent"
            :disabled="!studentFormValid"
            @click="saveStudent"
          ) Salvar

    v-dialog(v-model="deleteStudentDialog" max-width="400px")
      v-card
        v-card-title
          v-row(align="center")
            v-col
              span.text-h5 Confirmar Exclusão
            v-col(cols="auto")
              v-btn(icon @click="deleteStudentDialog = false")
                v-icon mdi-close

        v-card-text
          | Tem certeza que deseja excluir o aluno {{ studentToDelete?.name }}?
          | Esta ação não pode ser desfeita.

        v-card-actions
          v-spacer
          v-btn(text @click="deleteStudentDialog = false") Cancelar
          v-btn(
            color="error"
            :loading="deletingStudent"
            @click="deleteStudent"
          ) Excluir
</template>

<script>
import { sisgescAPI } from '@/api/index'

export default {
  name: 'AlunosPage',
  data() {
    return {
      // Guardian data
      guardians: [],
      loadingGuardians: false,
      guardianSearch: '',
      guardianDialog: false,
      guardianFormValid: false,
      savingGuardian: false,
      deleteGuardianDialog: false,
      deletingGuardian: false,
      guardianToDelete: null,
      defaultGuardian: {
        name: '',
        email: '',
        phone: '',
        cpf: '',
        address: '',
        status: 'active'
      },
      editedGuardian: { ...this.defaultGuardian },
      guardianHeaders: [
        { text: 'Nome', value: 'name' },
        { text: 'E-mail', value: 'email' },
        { text: 'Telefone', value: 'phone' },
        { text: 'CPF', value: 'cpf' },
        { text: 'Status', value: 'status' },
        { text: 'Ações', value: 'actions', sortable: false }
      ],

      // Student data
      selectedGuardian: null,
      students: [],
      loadingStudents: false,
      studentSearch: '',
      studentsDialog: false,
      studentDialog: false,
      studentFormValid: false,
      savingStudent: false,
      deleteStudentDialog: false,
      deletingStudent: false,
      studentToDelete: null,
      defaultStudent: {
        name: '',
        birthDate: '',
        gender: '',
        registration: '',
        notes: '',
        status: 'active',
        guardianId: null
      },
      editedStudent: { ...this.defaultStudent },
      studentHeaders: [
        { text: 'Nome', value: 'name' },
        { text: 'Matrícula', value: 'registration' },
        { text: 'Data de Nascimento', value: 'birthDate' },
        { text: 'Gênero', value: 'gender' },
        { text: 'Status', value: 'status' },
        { text: 'Ações', value: 'actions', sortable: false }
      ],
      genderOptions: [
        { text: 'Masculino', value: 'male' },
        { text: 'Feminino', value: 'female' },
        { text: 'Outro', value: 'other' }
      ]
    }
  },
  async created() {
    await this.loadGuardians()
  },
  methods: {
    // Guardian methods
    async loadGuardians() {
      this.loadingGuardians = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Fake guardian data
        const fakeGuardians = [
          {
            id: '1',
            name: 'Maria Silva',
            email: 'maria.silva@example.com',
            phone: '(11) 98765-4321',
            cpf: '123.456.789-00',
            address: 'Rua das Flores, 123 - São Paulo, SP',
            status: 'active'
          },
          {
            id: '2',
            name: 'Carlos Santos',
            email: 'carlos.santos@example.com',
            phone: '(11) 91234-5678',
            cpf: '987.654.321-00',
            address: 'Av. Principal, 456 - São Paulo, SP',
            status: 'active'
          },
          {
            id: '3',
            name: 'Sandra Oliveira',
            email: 'sandra.oliveira@example.com',
            phone: '(11) 99876-5432',
            cpf: '456.789.123-00',
            address: 'Rua dos Pássaros, 789 - São Paulo, SP',
            status: 'inactive'
          }
        ]

        this.guardians = fakeGuardians
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading guardians:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao carregar responsáveis. Tente novamente.'
        })
      } finally {
        this.loadingGuardians = false
      }
    },
    openGuardianDialog(guardian = null) {
      this.editedGuardian = guardian
        ? { ...guardian }
        : { ...this.defaultGuardian }
      this.guardianDialog = true
    },
    async saveGuardian() {
      if (!this.$refs.guardianForm.validate()) {
        return
      }

      this.savingGuardian = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (this.editedGuardian.id) {
          // Update existing guardian
          const index = this.guardians.findIndex(
            (g) => g.id === this.editedGuardian.id
          )
          if (index !== -1) {
            this.guardians.splice(index, 1, { ...this.editedGuardian })
          }
        } else {
          // Add new guardian
          const newGuardian = {
            ...this.editedGuardian,
            id: String(this.guardians.length + 1)
          }
          this.guardians.push(newGuardian)
        }

        this.guardianDialog = false

        this.$store.dispatch('snackbar/show', {
          color: 'success',
          text: `Responsável ${
            this.editedGuardian.id ? 'atualizado' : 'adicionado'
          } com sucesso!`
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving guardian:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao salvar responsável. Tente novamente.'
        })
      } finally {
        this.savingGuardian = false
      }
    },
    confirmDeleteGuardian(guardian) {
      this.guardianToDelete = guardian
      this.deleteGuardianDialog = true
    },
    async deleteGuardian() {
      this.deletingGuardian = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const index = this.guardians.findIndex(
          (g) => g.id === this.guardianToDelete.id
        )
        if (index !== -1) {
          this.guardians.splice(index, 1)
        }

        this.deleteGuardianDialog = false

        this.$store.dispatch('snackbar/show', {
          color: 'success',
          text: 'Responsável excluído com sucesso!'
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting guardian:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao excluir responsável. Tente novamente.'
        })
      } finally {
        this.deletingGuardian = false
      }
    },

    // Student methods
    async viewGuardianStudents(guardian) {
      this.selectedGuardian = guardian
      this.studentsDialog = true
      await this.loadStudents(guardian.id)
    },
    async loadStudents(guardianId) {
      this.loadingStudents = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Fake student data
        const fakeStudents = [
          {
            id: '1',
            name: 'João Silva',
            birthDate: '2010-05-15',
            gender: 'male',
            registration: '2024001',
            notes: 'Aluno aplicado',
            status: 'active',
            guardianId: guardianId
          },
          {
            id: '2',
            name: 'Ana Santos',
            birthDate: '2012-03-22',
            gender: 'female',
            registration: '2024002',
            notes: '',
            status: 'active',
            guardianId: guardianId
          },
          {
            id: '3',
            name: 'Pedro Oliveira',
            birthDate: '2011-08-10',
            gender: 'male',
            registration: '2024003',
            notes: 'Necessita acompanhamento',
            status: 'inactive',
            guardianId: guardianId
          }
        ]

        this.students = fakeStudents
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading students:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao carregar alunos. Tente novamente.'
        })
      } finally {
        this.loadingStudents = false
      }
    },
    openStudentDialog(student = null) {
      this.editedStudent = student
        ? { ...student }
        : { ...this.defaultStudent, guardianId: this.selectedGuardian.id }
      this.studentDialog = true
    },
    async saveStudent() {
      if (!this.$refs.studentForm.validate()) {
        return
      }

      this.savingStudent = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (this.editedStudent.id) {
          // Update existing student
          const index = this.students.findIndex(
            (s) => s.id === this.editedStudent.id
          )
          if (index !== -1) {
            this.students.splice(index, 1, { ...this.editedStudent })
          }
        } else {
          // Add new student
          const newStudent = {
            ...this.editedStudent,
            id: String(this.students.length + 1)
          }
          this.students.push(newStudent)
        }

        this.studentDialog = false

        this.$store.dispatch('snackbar/show', {
          color: 'success',
          text: `Aluno ${
            this.editedStudent.id ? 'atualizado' : 'adicionado'
          } com sucesso!`
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving student:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao salvar aluno. Tente novamente.'
        })
      } finally {
        this.savingStudent = false
      }
    },
    confirmDeleteStudent(student) {
      this.studentToDelete = student
      this.deleteStudentDialog = true
    },
    async deleteStudent() {
      this.deletingStudent = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const index = this.students.findIndex(
          (s) => s.id === this.studentToDelete.id
        )
        if (index !== -1) {
          this.students.splice(index, 1)
        }

        this.deleteStudentDialog = false

        this.$store.dispatch('snackbar/show', {
          color: 'success',
          text: 'Aluno excluído com sucesso!'
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting student:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao excluir aluno. Tente novamente.'
        })
      } finally {
        this.deletingStudent = false
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
