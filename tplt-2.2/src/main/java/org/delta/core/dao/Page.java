package org.delta.core.dao;

import org.delta.core.utils.ValueMap;

import java.util.ArrayList;
import java.util.List;

public class Page extends ArrayList<ValueMap> {
    private int start;
    private int limit;
    private int totalCount;

    public Page() {
    }

    public Page(List<ValueMap> items, int start, int limit, int totalCount) {
        this.start = start;
        this.limit = limit;
        this.totalCount = totalCount;
        this.addAll(items);
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
}
