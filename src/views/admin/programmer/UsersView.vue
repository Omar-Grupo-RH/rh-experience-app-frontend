<script setup>
import UserList from "@/components/programmer/UserList.vue";
import { useUserStore } from "@/stores/programmer/userStore";
import { onMounted, watch } from "vue";

const userStore = useUserStore();

onMounted(async () => {
  await userStore.getUsers();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Gestión de usuarios</h2>
        <p class="text-gray-400">Administra los usuarios aquí.</p>
      </div>
    </div>

    <div class="rounded-lg bg-white p-5">
      <div class="flex justify-end">
        <button
          class="bg-experience-blue text-white px-4 py-2 rounded cursor-pointer shadow"
          @click="userStore.openCreateModal"
        >
          + Nuevo usuario
        </button>
      </div>
      <h3 class="text-xl font-semibold">Lista de usuarios</h3>
      <div class="my-5">
        <UserList
          :usersList="userStore.users"
          @edit-user="userStore.handleEditUser"
          @delete-user="userStore.handleDeleteUser"
        />
      </div>

      <div
        v-if="userStore.showEditModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">Editar usuario</h3>

          <div class="space-y-3">
            <div>
              <FormKit
                type="form"
                id="editUserForm"
                @submit="userStore.handleUpdateUser"
                :actions="false"
                incomplete-message="No se pudo enviar, revisa las notificaciones"
              >
                <FormKit
                  type="text"
                  label="Nombre completo"
                  name="full_name"
                  v-model="userStore.selectedUser.full_name"
                  placeholder="Jhon Doe"
                  validation="required|length:3"
                  :validation-messages="{
                    required: 'El usuario es obligatorio',
                    length: 'El usuario debe tener al menos 3 caracteres',
                  }"
                />
                <FormKit
                  type="text"
                  label="Nombre de usuario"
                  name="username"
                  v-model="userStore.selectedUser.username"
                  placeholder="Jhon"
                  validation="required|length:3"
                  :validation-messages="{
                    required: 'El usuario es obligatorio',
                    length: 'El usuario debe tener al menos 3 caracteres',
                  }"
                />

                <FormKit
                  type="password"
                  label="Cambiar contraseña"
                  name="password"
                  placeholder="Ingresa la nueva contraseña"
                  validation="length:6"
                  :validation-messages="{
                    required: 'La nueva contraseña es obligatoria',
                    length: 'La contraseña debe tener al menos 6 caracteres',
                  }"
                />

                <div class="mt-6 flex justify-around items-center gap-3">
                  <button
                    class="bg-gray-100 w-1/2 h-fit py-2 px-4 rounded cursor-pointer shadow"
                    @click="userStore.closeEditModal"
                  >
                    Cancelar
                  </button>
                  <div class="w-1/2">
                    <FormKit type="submit">Guardar datos</FormKit>
                  </div>
                </div>
              </FormKit>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="userStore.showCreateModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">Agregar usuario</h3>

          <div class="space-y-3">
            <div>
              <FormKit
                type="form"
                id="createUserForm"
                @submit="userStore.handleCreateUser"
                :actions="false"
                incomplete-message="No se pudo enviar, revisa las notificaciones"
              >
              <FormKit
                  type="text"
                  label="Nombre completo"
                  name="full_name"
                  v-model="userStore.formNewUser.full_name"
                  placeholder="Jhon Doe"
                  validation="required|length:3"
                  :validation-messages="{
                    required: 'El nombre es obligatorio',
                    length: 'El nombre debe tener al menos 3 caracteres',
                  }"
                />
                <FormKit
                  type="text"
                  label="Nombre de usuario"
                  name="username"
                  placeholder="jhon_doe"
                  v-model="userStore.formNewUser.username"
                  validation="required|length:3"
                  :validation-messages="{
                    required: 'El usuario es obligatorio',
                    length: 'El usuario debe tener al menos 3 caracteres',
                  }"
                />
                <FormKit
                  type="select"
                  label="¿Qué tipo de privilegios tendrá?"
                  name="admin"
                  placeholder="Selecciona una opcion"
                  v-model="userStore.formNewUser.admin"
                  :options="[
                    {
                      label: 'Selecciona una opcion',
                      value: '',
                      attrs: { disabled: true },
                    },
                    { label: 'Super administrador', value: '1' },
                    { label: 'Adminstrador', value: '2' },
                    // {
                    //   label: 'Cobranza',
                    //   value: '3',
                    // },
                    // {
                    //   label: 'Usuario',
                    //   value: '4',
                    // },
                  ]"
                  validation="required"
                  validation-visibility="dirty"
                  :validation-messages="{
                    required: 'Debes seleccionar una opcion',
                  }"
                />
                <FormKit
                  type="password"
                  label="Contraseña"
                  name="password"
                  placeholder="Ingresa la contraseña"
                  v-model="userStore.formNewUser.password"
                  validation="required|length:6"
                  :validation-messages="{
                    required: 'La contraseña es obligatoria',
                    length: 'La contraseñe debe tener al menos 6 caracteres',
                  }"
                />

                <div class="mt-6 flex justify-around items-center gap-3">
                  <button
                    type="button"
                    class="bg-gray-100 w-1/2 h-fit py-2 px-4 rounded cursor-pointer shadow"
                    @click="userStore.closeCreateModal"
                  >
                    Cancelar
                  </button>
                  <div class="w-1/2">
                    <FormKit type="submit">Guardar datos</FormKit>
                  </div>
                </div>
              </FormKit>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
