import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from "react-bootstrap";
import { trafficList } from '../../functions/maps';


export const useHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [timeRange, setTimeRange] = useState('all');
    const [timeParams, setTimeParams] = useState({
        start: '00:00:00',
        end: '23:59:59'
    });

    useEffect(() => {
        switch (timeRange) {
            case 'morning':
                setTimeParams({ start: '06:00:00', end: '11:59:59' });
                break;
            case 'afternoon':
                setTimeParams({ start: '12:00:00', end: '17:59:59' });
                break;
            case 'evening':
                setTimeParams({ start: '18:00:00', end: '23:59:59' });
                break;
            default:
                setTimeParams({ start: '00:00:00', end: '23:59:59' });
        }
    }, [timeRange]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await trafficList(timeParams.start, timeParams.end);

                const formattedData = (data?.traffic || []).map(point => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: point.coords || [0, 0]
                    },
                    properties: {
                        weight: point.weight || 1
                    }
                }));

                setHeatmapData(formattedData);
            } catch (error) {
                console.error('Failed to load heatmap data:', error);
                setHeatmapData([]);
            }
        };

        fetchData();
    }, [timeParams]);

    return { heatmapData, timeRange, setTimeRange };
};

export const AddTrafficPointModal = ({ show, coords, onHide, onSave }) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [currentTime, setCurrentTime] = useState('');

    const handleAddTime = () => {
        if (currentTime) {
            setTimeSlots([...timeSlots, currentTime]);
            setCurrentTime('');
        }
    };

    const handleSave = () => {
        if (!timeSlots.length || !coords) {
            alert("�������� ��������� ����� � ���������, ��� ������� ����������");
            return;
        }

        onSave({
            coords,
            timeSlots
        });

        setTimeSlots([]);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>�������� ����� �������������</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>����������</Form.Label>
                        <div className="text-muted">
                            ������: {coords?.[0]?.toFixed(6)}, �������: {coords?.[1]?.toFixed(6)}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>��������� ����� ��������*</Form.Label>
                        <div className="d-flex mb-2">
                            <Form.Control
                                type="time"
                                value={currentTime}
                                onChange={(e) => setCurrentTime(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleAddTime} className="ms-2">
                                �������� �����
                            </Button>
                        </div>

                        {timeSlots.length > 0 && (
                            <div className="mt-2">
                                <h6>����������� �����:</h6>
                                <ul>
                                    {timeSlots.map((slot, i) => (
                                        <li key={i}>{slot}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    ������
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    �������� �����
                </Button>
            </Modal.Footer>
        </Modal>
    );
};