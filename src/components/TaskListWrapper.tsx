import React, { useEffect, useState } from 'react';
import { List } from './TaskList';
import ListHook from '../hooks/ListHook';
import { useSelector } from 'react-redux';
import { getIsFetching } from '../redux/selectors/selectors';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import QueryParams from '../utils/QueryParams';
import { getTasks } from '../redux/actions';
import { useStyles } from './TaskListWrapper.styles';
import Filter from './Filter';
import Preloader from './Preloader/Preloader';
import { DateType } from '@date-io/type';

type ListWrapperType = {
  isListDone: boolean;
  selectedDateFrom: DateType | null;
  selectedDateTo: DateType | null;
}

export const ListWrapper: React.FC<ListWrapperType> = ({
  isListDone,
  selectedDateFrom,
  selectedDateTo,
}) => {
  const classes = useStyles();
  const isFetching = useSelector(getIsFetching);
  const locationPath = useLocation();
  const parsed = queryString.parse(window.location.search);

  const [dateSort, setDateSort] = useState(() => {
    return parsed._sort === ('isFavorite,date' || 'isFavorite,date,title');
  });

  const [nameSort, setNameSort] = useState(() => {
    return parsed._sort === ('isFavorite,date' || 'isFavorite,date,title');
  });

  const [categoryId, setCategoryId] = useState(() => {
    return parsed.categoryId;
  });

  const { tasks, unDoneTasks, categories, history, endNumber, dispatch } =
    ListHook();

  const [end, setEnd] = useState(endNumber);

  const dateFrom = selectedDateFrom
    ? selectedDateFrom.valueOf() - 43150000
    : 1577836800000;

  const dateTo = selectedDateTo
    ? selectedDateTo.valueOf() + 43150000
    : 1640995200000;

  const onDateSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateSort(e.target.checked);
  };

  const onNameSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameSort(e.target.checked);
  };

  useEffect(() => {
    /* parsed.categoryId ? setCategoryId(parsed.categoryId) : null; */
    switch (parsed._sort) {
      case 'isFavorite,date': {
        setDateSort(true);
        QueryParams._sort[1] = 'date';
        QueryParams._order[1] = 'asc';
        break;
      }
      case 'isFavorite,title': {
        setNameSort(true);
        QueryParams._sort[2] = 'title';
        QueryParams._order[2] = 'asc';
        break;
      }
      case 'isFavorite,date,title': {
        setDateSort(true);
        QueryParams._sort[1] = 'date';
        QueryParams._order[1] = 'asc';
        setNameSort(true);
        QueryParams._sort[2] = 'title';
        QueryParams._order[2] = 'asc';
        break;
      }
      default:
        break;
    }
  }, []);

  useEffect(() => {
    QueryParams._sort[1] = dateSort ? 'date' : null;
    QueryParams._sort[2] = nameSort ? 'title' : null;
    QueryParams._order[1] = dateSort ? 'asc' : null;
    QueryParams._order[2] = nameSort ? 'asc' : null;
    QueryParams.categoryId = categoryId;

    const searchString = queryString.stringify(QueryParams, {
      skipNull: true,
      arrayFormat: 'comma',
    });

    history.push({
      pathname: locationPath.pathname,
      search: searchString,
    });

    dispatch(getTasks({ isListDone, end, searchString, dateFrom, dateTo }));
  }, [dateSort, nameSort, categoryId, end, dateFrom, dateTo]);
  return (
    <div className={classes.AppCategoryChanger}>
      <Filter
        onDateSortChange={onDateSortChange}
        onNameSortChange={onNameSortChange}
        dateSort={dateSort}
        nameSort={nameSort}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
      />
      {isFetching ? <Preloader /> : null}
      <List
        tasks={!isListDone ? unDoneTasks : tasks}
        isListDone={isListDone}
        categories={categories}
        end={end}
        setEnd={setEnd}
      />
    </div>
  );
};