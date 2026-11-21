package com.kgm.group.lugtrac.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IotSyncPayload {
    private String rfidUid;
    private Double weight;
    private boolean reedSwitchClosed;
}
