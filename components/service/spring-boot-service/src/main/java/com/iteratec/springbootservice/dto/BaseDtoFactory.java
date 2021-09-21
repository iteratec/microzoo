package com.iteratec.springbootservice.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class BaseDtoFactory {
    private static final Random random = new Random();

    private BaseDtoFactory() {
        // prevent instantiation
    }

    public static List<BaseDto> createArray(int size, int payloadSize) {
        List<BaseDto> result = new ArrayList<>(size);

        for (long index = 0; index < size; index++) {
            result.add(BaseDto.builder()
                    .id(index)
                    .payload(createRandomString(payloadSize))
                    .build());
        }

        return result;
    }

    public static String createRandomString(int size) {
        String alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"§$%&/()=?,;.:-_#+*";
        return random.ints(size, 0, alphabet.length())
                .map(alphabet::charAt)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}
