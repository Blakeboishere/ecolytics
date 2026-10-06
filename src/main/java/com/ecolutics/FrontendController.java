package com.ecolutics;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Serves the React application for its client-side routes. */
@Controller
public class FrontendController {

    @GetMapping({"/", "/login", "/signup", "/remnant-entry", "/donate", "/profile", "/waste/{type}"})
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}
