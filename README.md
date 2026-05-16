# 🛡️ M-Poparcie

> Anonimowy i nielinkowalny system do głosowania i podpisywania petycji, oparty na kryptografii NP Zero-Knowledge Proofs (zkpSNARK).

mPoparcie to nowoczesny, anonimowy i nielinkowalny system open-source do wyrażania poparcia dla petycji, a w przyszłości także do głosowania elektronicznego (e-votingu). Naszym celem jest przeniesienie zaufania, jakie mamy do tradycyjnej, papierowej urny wyborczej, do świata cyfrowego.

Dzięki zastosowaniu zaawansowanych technologii kryptograficznych i mObywatela, system pozwala stwierdzić że jesteś prawdziwym człowiekiem uprawnionym do oddania głosu, jednocześnie nie wiedząc o tobie nic.

---

## Struktura Repozytorium (Ważne!)

W tym repozytorium znajduje się sam backend, aby zapoznać się z resztą kodu,
👉 **[odwiedź repozytorium](https://github.com/Wikmano/PoparcieFE)**

Nasz workflow opiera się na dwóch głównych gałęziach. Zanim zaczniesz działać, upewnij się, że jesteś na odpowiednim branchu:

*  **Branch [`dev`](https://github.com/TWOJ_NICK/TWOJE_REPO/tree/dev) - Środowisko Lokalne**
    To jest Twoje piaskownica. Ta gałąź zawiera wszystkie pliki konfiguracyjne (np. pliki `.env_template`, lokalne skrypty uruchomieniowe, ewentualnie pliki `docker-compose.yml`), które pozwalają odpalić cały system na Twoim komputerze w kilka minut. Tutaj testujemy nowe funkcje i robimy eksperymenty.

*  **Branch [`main`](https://github.com/TWOJ_NICK/TWOJE_REPO/tree/main) - Deployment (Produkcja)**
    Czysty kod gotowy na serwer. Ta gałąź jest zoptymalizowana pod kątem wdrożenia na maszynę produkcyjną. Nie znajdziesz tu narzędzi developerskich, które mogłyby obciążać środowisko na produkcji. Zmiany z `dev` trafiają tutaj dopiero po dokładnych testach.

---

##  Dokumentacja i Architektura

Jeśli chcesz zrozumieć, co dzieje się pod maską (zwłaszcza skomplikowane przepływy generowania dowodów ZKP i weryfikacji tożsamości), zajrzyj do folderu **`/docs`**.

Znajdziesz tam **schematy sekwencyjne**, które krok po kroku tłumaczą:
* Jak użytkownik rejestruje się w drzewie Merkle'a.
* Jak przebiega komunikacja przeglądarki z serwerem podczas pobierania ścieżek.
* Jak i gdzie weryfikowany jest głos z użyciem biblioteki Semaphore.

👉 **[Przejdź do folderu /docs](./docs)**

---

## Jak uruchomić projekt lokalnie?

WAŻNE!
W tym repozytorium znajduje się sam backend, aby pobrać resztę kodu,
👉 **[odwiedź repozytorium](https://github.com/Wikmano/PoparcieFE)**

1. Sklonuj repozytorium na swój dysk:
   ```bash
   git clone [https://github.com/Luk1104/mPoparcie-backend.git](https://github.com/Luk1104/mPoparcie-backend.git)

2. Upewnij się że jesteś na branchu do testowania lokalnie
```bash
   git checkout dev

3. Uruchom kod w środowisku docker
```bash
   sudo docker compose up