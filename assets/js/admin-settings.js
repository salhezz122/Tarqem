import { requireAdmin, doLogout } from "./auth-helpers.js";
import { setActiveNav } from "./ui.js";

requireAdmin();
setActiveNav();
document.querySelector('#logoutBtn').addEventListener('click', doLogout);