package com.kgm.group.lugtrac.request;

import lombok.Data;
import java.util.List;

@Data
public class BaggageRequest {
    private String pnr;
    private String rfidUid;
    private String currentStatus;
    private String currentCheckpoint;
    private List<String> mediaUrls;
}