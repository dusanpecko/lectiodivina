# 🔐 Bezpečnostný kód pre mazanie notifikácií

## Pre administrátorov

Ak potrebujete **vymazať notifikáciu z histórie**, systém vyžaduje zadanie **tajného bezpečnostného kódu**.

### Ako získať kód?
Kód je **prísne dôverný** a pozná ho len hlavný administrátor. Ak ho potrebujete:

1. **Kontaktujte hlavného administrátora** osobne
2. **Nikdy nepýtajte kód cez email** alebo verejný chat
3. **Kód sa nemení** často, takže si ho zapamätajte

### Prečo je kód potrebný?
- Zabránenie náhodnému vymazaniu histórie
- Audit trail - iba oprávnení administrátori môžu mazať
- Ochrana pred neautorizovaným prístupom

### Čo ak zabudnem kód?
- Opýtajte sa hlavného administrátora
- Kód sa **nezobrazuje v systéme**
- Nie je možné ho "obnoviť" - musíte ho poznať

---

## Pre hlavného administrátora

### Aktuálny kód
- Kód je nastavený v `/src/app/api/admin/notification-logs/route.ts`
- Predvolená hodnota: `xxxxx`
- **ODPORÚČAME ZMENIŤ** na vlastný tajný kód

### Ako zmeniť kód
Pozrite si: [`docs/NOTIFICATION_DELETE_SECURITY.md`](./NOTIFICATION_DELETE_SECURITY.md)

### Komu poskytnúť kód
✅ Vedúci tímu  
✅ Senior administrátori  
❌ Junior administrátori  
❌ Externí dodávatelia  
❌ Support tím  

### Bezpečnostné odporúčania
- Mení kód každých 3-6 mesiacov
- Používajte silný náhodný kód (min. 8 znakov)
- Zdieľajte len cez šifrované kanály
- Dokumentujte, kto kód pozná
