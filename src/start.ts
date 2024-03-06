import { defaultApplicationContext } from "./applicationContext";

const { jobService } = defaultApplicationContext;
void jobService.start().then(jobService.runAllJobs);
