import {GbService} from "./GbService";

export class ActionHandler {

  private readonly gbService: GbService

  constructor(gbService: GbService) {
    this.gbService = gbService
  }

  public handleActions(actionType: string, data: any) {
    switch (actionType) {
      case "move":
        this.gbService.topicMap.get("move")?.publish(data);
        break;
      case "dataCollectionMode":
        this.gbService.topicMap.get("dataCollection")?.publish(data);
        break;
    }
  }

  private publish(topicKey: string, data: any) {
    this.gbService.topicMap.get(topicKey)?.publish(data);
  }
}
