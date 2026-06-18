<script setup>
import UserList from "@/components/programmer/UserList.vue";
import { useUserStore } from "@/stores/programmer/userStore";
import { onMounted } from "vue";

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
                :classes="{
                  message: 'hidden',
                }"
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

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="userStore.showCreateModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-xs"
            @click.self="userStore.closeCreateModal"
          >
            <Transition
              appear
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="translate-y-4 scale-95 opacity-0"
              enter-to-class="translate-y-0 scale-100 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 scale-100 opacity-100"
              leave-to-class="translate-y-4 scale-95 opacity-0"
            >
              <div
                class="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-slate-200"
              >
                <!-- Header -->
                <div
                  class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5"
                >
                  <div>
                    <p
                      class="text-sm font-semibold uppercase tracking-[0.18em] text-experience-blue"
                    >
                      Gestión de usuarios
                    </p>

                    <h3 class="mt-1 text-2xl font-black text-slate-900">
                      Agregar usuario
                    </h3>

                    <p class="mt-1 text-sm text-slate-500">
                      Completa la información para crear un nuevo acceso al
                      sistema.
                    </p>
                  </div>

                  <button
                    type="button"
                    class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                    aria-label="Cerrar modal"
                    @click="userStore.closeCreateModal"
                  >
                    ✕
                  </button>
                </div>

                <!-- Body -->
                <div class="px-6 py-6">
                  <FormKit
                    type="form"
                    id="createUserForm"
                    @submit="userStore.handleCreateUser"
                    :actions="false"
                    :classes="{
                      message: 'hidden',
                    }"
                  >
                    <FormKit
                      type="text"
                      label="Nombre completo"
                      name="full_name"
                      v-model="userStore.formNewUser.full_name"
                      placeholder="Ej. John Doe"
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
                      placeholder="Ej. john_doe"
                      v-model="userStore.formNewUser.username"
                      validation="required|length:3"
                      :validation-messages="{
                        required: 'El usuario es obligatorio',
                        length: 'El usuario debe tener al menos 3 caracteres',
                      }"
                    />

                    <FormKit
                      type="select"
                      label="Tipo de privilegios"
                      name="admin"
                      placeholder="Selecciona una opción"
                      v-model="userStore.formNewUser.admin"
                      :options="[
                        {
                          label: 'Selecciona una opción',
                          value: '',
                          attrs: { disabled: true },
                        },
                        { label: 'Super administrador', value: '1' },
                        { label: 'Administrador', value: '2' },
                        { label: 'Front Desk', value: '3' },
                      ]"
                      validation="required"
                      validation-visibility="dirty"
                      :validation-messages="{
                        required: 'Debes seleccionar una opción',
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
                        length:
                          'La contraseña debe tener al menos 6 caracteres',
                      }"
                    />

                    <div
                      class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
                    >
                      <button
                        type="button"
                        class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        @click="userStore.closeCreateModal"
                      >
                        Cancelar
                      </button>

                      <FormKit
                        type="submit"
                        :classes="{
                          input:
                            'inline-flex w-full sm:w-auto cursor-pointer items-center justify-center rounded-lg bg-experience-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-experience-blue/90 disabled:cursor-not-allowed disabled:opacity-60',
                        }"
                      >
                        Guardar usuario
                      </FormKit>
                    </div>
                  </FormKit>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>
