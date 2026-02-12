# 🔧 Runbook - Munkafolyamat szabályok

## 📋 Általános szabályok

### 1. Böngésző tesztelés
**FONTOS:** Minden módosítás után Claude először a böngészőben teszteli az alkalmazást, és csak utána szól a felhasználónak, hogy nézzen rá.

**Lépések:**
1. Módosítások elvégzése
2. Böngésző megnyitása/frissítése
3. Funkciók tesztelése
4. Hibák ellenőrzése (console, network)
5. **Csak ezután** értesíteni a felhasználót

**Példa:**
```
❌ ROSSZ: "Kész, próbáld ki a böngészőben!"
✅ JÓ: "Teszteltem böngészőben, minden működik. Most már te is megnézheted!"
```

---

## 🚀 Projekt specifikus információk

### Port információ
- **Aktív port:** 8200
- **Fő URL:** http://localhost:8200/index.html

### UI5 CDN
- **Aktív (működik):** https://sdk.openui5.org/resources/sap-ui-core.js
- **Tartalék #1:** https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js
- **Tartalék #2 (helyi):** http://192.168.1.10:9000/resources/sap-ui-core.js

**Ismert problémák (2026-02-12):**
- SAP CDN időnként 503 hibát ad (Service Unavailable)
- Helyi szerver (192.168.1.10:9000) nem mindig elérhető
- **Megoldás:** OpenUI5 SDK CDN megbízhatóbb

### Tesztelési checklist
- [ ] Oldal betöltődik
- [ ] UI5 komponensek renderelődnek
- [ ] Dupla-kattintás működik
- [ ] Toast üzenetek megjelennek
- [ ] Szerkesztés után blur visszaállítja read-only módot

### Böngésző indítás módok
```bash
# Normál böngésző
start chrome "http://localhost:8200/index.html"

# Inkognito mód (cache és extension nélkül)
start chrome --incognito "http://localhost:8200/index.html"
```

**Megjegyzés:** Inkognito mód hasznos ha:
- Cache problémák vannak
- Extension-ök interferálnak
- Tiszta tesztkörnyezet kell

---

## 📝 Verziókezelés

### Commit előtt
1. Tesztelés böngészőben
2. Git status ellenőrzése
3. Commit message megfogalmazása
4. Push GitHub-ra

### Branch stratégia
- **master:** Production ready kód
- **feature/*** : Új funkciók fejlesztése

---

## 🐛 Hibaelhárítás

### UI5 nem tölt be
1. **Hard refresh** először: `Ctrl+Shift+R` (cache tisztítás)
2. Ellenőrizd a CDN elérhetőségét (Network tab)
   - Ha 503 hiba → CDN váltás
3. Console hibák ellenőrzése (`F12` → Console tab)
4. Network requestek vizsgálata
   - Keress `sap-ui-core.js` kéréseket
   - Ellenőrizd a status kódokat (200 = OK, 503 = hiba)
5. Ha semmi sem segít → Inkognito mód próba

**Gyakori hibák:**
- **Üres oldal** = UI5 CDN nem elérhető vagy cache probléma
- **503 error** = Szerver túlterhelt vagy nem elérhető
- **CORS error** = Helyi szerver konfigurációs probléma

### Dupla-kattintás nem működik
1. Event listener csatolva van-e
2. setTimeout megfelelően fut-e
3. Editable property változik-e

---

**Utolsó frissítés:** 2026-02-12
**Verziók:** UI5 1.105.0, Node.js http-server
