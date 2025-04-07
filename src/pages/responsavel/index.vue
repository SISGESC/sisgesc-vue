<template lang="pug">
v-container
  v-row
    v-col(cols="12")
      h1.text-h4.mb-4 Meus Dependentes

  v-row
    v-col(
      v-for="child in children"
      cols="12"
      :key="child.id"
      md="6"
    )
      v-card.mb-4
        v-card-title
          v-row(align="center")
            v-col(cols="auto")
              v-avatar(color="primary" size="40")
                span.white--text {{ getInitials(child.name) }}
            v-col
              .text-h6 {{ child.name }}
            v-col(cols="auto")
              v-chip(
                :color="child.status === 'active' ? 'success' : 'error'"
                small
              ) {{ child.status === 'active' ? 'Ativo' : 'Inativo' }}

        v-card-text
          v-list(dense)
            v-list-item
              v-list-item-icon
                v-icon mdi-account
              v-list-item-content
                v-list-item-title Matrícula: {{ child.registration }}

            v-list-item
              v-list-item-icon
                v-icon mdi-school
              v-list-item-content
                v-list-item-title Turma: {{ child.class }}

        v-card-actions
          v-btn(
            color="primary"
            text
            @click="showPayments(child)"
          )
            v-icon(left) mdi-cash
            | Ver Pagamentos

  v-dialog(v-model="paymentsDialog" max-width="800")
    v-card
      v-card-title
        v-row(align="center")
          v-col
            .text-h5 Pagamentos - {{ selectedChild?.name }}
          v-col(cols="auto")
            v-btn(icon @click="paymentsDialog = false")
              v-icon mdi-close

      v-card-text
        v-data-table(
          :headers="paymentHeaders"
          :items="selectedChildPayments"
          :items-per-page="5"
          :loading="loadingPayments"
        )
          template(v-slot:item.status="{ item }")
            v-chip(:color="getPaymentStatusColor(item.status)" small) {{ getPaymentStatusText(item.status) }}

          template(v-slot:item.amount="{ item }")
            | R$ {{ formatCurrency(item.amount) }}

          template(v-slot:item.dueDate="{ item }")
            | {{ formatDate(item.dueDate) }}

          template(v-slot:item.paymentDate="{ item }")
            | {{ item.paymentDate ? formatDate(item.paymentDate) : '-' }}

      v-card-actions
        v-spacer
        v-btn(
          color="primary"
          text
          @click="paymentsDialog = false"
        ) Fechar
</template>

<script>
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sisgescAPI } from '@/api/index'

export default {
  name: 'ResponsavelPage',
  data() {
    return {
      children: [],
      paymentsDialog: false,
      selectedChild: null,
      selectedChildPayments: [],
      loadingPayments: false,
      paymentHeaders: [
        { text: 'Descrição', value: 'description' },
        { text: 'Valor', value: 'amount' },
        { text: 'Vencimento', value: 'dueDate' },
        { text: 'Pagamento', value: 'paymentDate' },
        { text: 'Status', value: 'status' }
      ]
    }
  },
  async created() {
    await this.loadChildren()
  },
  methods: {
    async loadChildren() {
      try {
        // TODO: Replace with actual API call
        // this.children = [
        //   {
        //     id: 1,
        //     name: 'João Silva',
        //     registration: '2024001',
        //     class: '3º Ano A',
        //     status: 'active'
        //   },
        //   {
        //     id: 2,
        //     name: 'Maria Silva',
        //     registration: '2024002',
        //     class: '1º Ano B',
        //     status: 'active'
        //   }
        // ]
        const myUUID = this.$store.getters['user/me'].uuid
        const token = this.$store.getters['user/token']
        // eslint-disable-next-line no-console
        console.log({ myUUID, token })
        const { data: students } = await sisgescAPI.get('/enrollments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        // eslint-disable-next-line no-console
        console.log({ students })
        // while api has no filter by parentId
        this.children = students
          .filter((student) => student.parentId === myUUID)
          .map((student) => ({
            ...student,
            name: student.studentName,
            registration: student.uuid.slice(0, 4),
            class: student.classGroup?.name,
            status: student.status ? 'active' : 'inactive'
          }))
      } catch (error) {
        console.error('Error loading children:', error)
        // TODO: Add proper error handling
      }
    },
    async showPayments(child) {
      this.selectedChild = child
      this.paymentsDialog = true
      this.loadingPayments = true

      try {
        // TODO: Replace with actual API call
        // await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
        // this.selectedChildPayments = [
        //   {
        //     id: 1,
        //     description: 'Mensalidade Janeiro',
        //     amount: 500.0,
        //     dueDate: '2024-01-10',
        //     paymentDate: '2024-01-08',
        //     status: 'paid'
        //   },
        //   {
        //     id: 2,
        //     description: 'Mensalidade Fevereiro',
        //     amount: 500.0,
        //     dueDate: '2024-02-10',
        //     paymentDate: null,
        //     status: 'pending'
        //   }
        // ]

        const myUUID = this.$store.getters['user/me'].uuid
        const token = this.$store.getters['user/token']
        console.log({ child })
        // eslint-disable-next-line no-console
        console.log({ myUUID, token })
        const { data: student } = await sisgescAPI.get(
          `/enrollments/${child.uuid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        this.selectedChildPayments = student.tuitions?.map((bill) => ({
          ...bill,
          status: bill.isPaid ? 'paid' : 'pending'
        }))
      } catch (error) {
        console.error('Error loading payments:', error)
        // TODO: Add proper error handling
      } finally {
        this.loadingPayments = false
      }
    },
    getInitials(name) {
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    },
    formatDate(date) {
      if (!date) {
        return '-'
      }
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
    },
    formatCurrency(value) {
      return value.toFixed(2).replace('.', ',')
    },
    getPaymentStatusColor(status) {
      const colors = {
        paid: 'success',
        pending: 'warning',
        overdue: 'error'
      }
      return colors[status] || 'grey'
    },
    getPaymentStatusText(status) {
      const texts = {
        paid: 'Pago',
        pending: 'Pendente',
        overdue: 'Atrasado'
      }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
