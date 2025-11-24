package com.example.mscompras.Configuraciones;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        Map<String, String> body = new HashMap<>();

        // aquí puedes ser genérico o ver el mensaje para saber si viene de suppliers
        body.put("message", "Ya existe un proveedor con ese nombre");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}