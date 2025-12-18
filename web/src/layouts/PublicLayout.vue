<template>
  <div>
    <div class="nav">
      <div class="container nav-inner">
        <router-link to="/articles"><strong>Template REST</strong></router-link>
        <div class="nav-links">
          <router-link to="/articles">Articles</router-link>
          <router-link to="/admin/articles">Admin</router-link>
        </div>
      </div>
    </div>

    <div class="container">
      <router-view />
    </div>
  </div>
</template>
