"use strict";const y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();const f=document.getElementById("searchForm");const i=document.getElementById("searchInput");if(f&&i)f.addEventListener("submit",e=>{e.preventDefault();const q=i.value.trim();if(!q){i.focus();return}alert("Search backend se agle step me connect hoga.

Search: "+q)});