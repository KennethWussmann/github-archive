import { defaultApplicationContext } from "./applicationContext";

const { archivalService } = defaultApplicationContext;
archivalService.start();
void archivalService.archive();
