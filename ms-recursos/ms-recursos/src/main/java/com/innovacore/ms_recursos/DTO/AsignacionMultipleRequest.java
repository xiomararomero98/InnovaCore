package com.innovacore.ms_recursos.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionMultipleRequest {

    @NotEmpty(message = "Debe seleccionar al menos un empleado")
    private List<Long> empleadosIds;

    @NotNull(message = "Las horas asignadas son obligatorias")
    @Min(value = 1, message = "Las horas asignadas deben ser mayores a 0")
    private Integer horasAsignadas;

    @NotBlank(message = "El rol en el proyecto es obligatorio")
    private String rolEnProyecto;
}
