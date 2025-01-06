package space.createyourhumanity.app.web.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import space.createyourhumanity.app.web.websocket.dto.ActivityDTO;

@RestController
public class TrackerController {

    @GetMapping("/websocket/tracker/info")
    public String getInfo() {
        return "{}";
    }
}
