<script setup>
import Link from './Link.vue';

</script>

<template>
    <nav class="w-full bg-experience-pink text-white flex justify-between items-center h-16">
        <div class="ml-16">
            <Link to="home">
                    <img src="/logos/Recurso9.svg" class="w-9" alt="">
                </Link>
        </div>

        <ul class="flex flex-col gap-3 md:flex-row md:gap-5">

            <li class="cursor-pointer h-16 px-5 flex justify-center items-center bg-experience-blue">
                <Link to="login">
                    Iniciar sesion
                </Link>
            </li>
        </ul>
    </nav>
</template>



