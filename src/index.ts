import express, { type Request, type Response } from "express";
import petitionUsersRoute from "./modules/petition-users/petition-users.route.js";

const app = express();
// Używamy portu z pliku .env, a jeśli go nie ma, domyślnie 3000
const PORT = process.env.PORT || 3000;

// Middleware pozwalający na czytanie body z zapytań w formacie JSON (przyda Ci się później)
app.use(express.json());
// Podłączamy API routes (login/register)
app.use("/api/petition/user", petitionUsersRoute);

// Główny endpoint testowy
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Serwer deweloperski działa jak marzenie! 🚀",
    time: new Date().toLocaleTimeString(),
  });
});

// Prosty endpoint typu health-check
app.get("/ping", (req: Request, res: Response) => {
  res.send("pong 🏓");
});

// Uruchomienie nasłuchiwania
app.listen(PORT, () => {
  console.log(`\n---`);
  console.log(`[${new Date().toLocaleTimeString()}] 🟢 Serwer wystartował!`);
  console.log(`Nasłuchuję na: http://localhost:${PORT}`);
  console.log(
    `Spróbuj zmienić tekst w index.ts i zapisać plik, aby sprawdzić auto-restart.`,
  );
  console.log(`---\n`);
});
